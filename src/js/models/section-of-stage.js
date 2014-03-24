/** @module */
define(['knockout',
		'constants/stage-constants',
		'helpers/app-helper',
		'models/file-spec',
		'services/file-spec',
		'models/pre-file'],
	function (ko,
		stageCnst,
		appHelper,
		FileSpec,
		fileSpecService,
		PreFile) {
	'use strict';

	/**
	 * Import file specification to the list
	 * @param {object} data - Server data with file specs
	 */
	function importFileSpecs(data) {
		return (data || []).map(function (item) {
			return new FileSpec(item);
		});
	}

	/**
	 * Section base: shared props for other types of sections - insert using call method
	 * @constructor
	 * @param {object} data - Section data
	 */
	var exports = function (data, parentStage, idOfParentStage) {
		/** Get parent (well) */
		this.getParent = function () {
			return parentStage;
		};

		/**
		 * Id of parent stage of section. Duplicated in section.parentId and section.parent.id
		 * @type {string}
		 */
		this.idOfParentStage = idOfParentStage;

		/**
		 * Stage, like 'well', 'wield', 'wroup', 'wegion', 'company'
		 * @type {string}
		 */
		this.stageKey = this.getParent().stageKey;

		/**
		 * Section guid
		 * @type {string}
		 */
		this.id = data.Id;

		/**
		 * Whether the section is visible as a view: can ovveride default checkbox from section pattern (isView)
		 * @type {boolean}
		 */
		this.isVisible = ko.observable(data.IsVisible);

		/**
		 * Id of section pattern: contains info like section Name and other
		 * @type {string}
		 */
		this.sectionPatternId = data.SectionPatternId;

		/**
		 * Section pattern (default name, file formats and other params for section)
		 * @type {module:models/section-pattern}
		 */
		this.sectionPattern = ko.computed({
				read : this.calcSectionPattern,
				deferEvaluation : true,
				owner : this
			});

    //{ #region HACK-VIEW-PROPS
    
		/**
		 * A hack property, needed for the section-panel-well partial
		 *    to show a perfomance menu with groups (a select input)
		 * @type {boolean}
		 */
		this.isSectionPatternIdIsWellPerfomance = this.sectionPatternId === stageCnst.well.ptrn.perfomance;

		/**
		 * A hack property, needed for the section-panel-well partial
		 *    to show a joined menu: volume and sketch
		 * @type {boolean}
		 */
		this.isSectionPatternIdIsWellSketch = this.sectionPatternId === stageCnst.well.ptrn.sketch;

		/**
		 * A hack property, needed for the section-panel-well partial
		 *    to show a joined menu: volume and sketch
		 * @type {boolean}
		 */
		this.isSectionPatternIdIsWellVolume = this.sectionPatternId === stageCnst.well.ptrn.volume;

    //} #endregion HACK-VIEW-PROPS
    
		/**
		 * Whether section is visible as view: calculated using section checkbox and pattern checkbox
		 * @type {boolean}
		 */
		this.isVisibleAsView = ko.computed({
				read : this.calcIsVisibleAsView,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * List of file specifications
		 * @type {Array.<module:models/file-spec>}
		 */
		this.listOfFileSpec = ko.observableArray();

		/**
		 * A list of uploading files
		 * @type {Array.<module:models/pre-file>}
		 */
		this.listOfPreFile = ko.observableArray();

		/**
		 * Sorted and filtered list of files: ready to view
		 * @type {Array.<module:models/file-spec>}
		 */
		this.readyListOfFileSpec = ko.computed({
				read : this.buildReadyListOfFileSpec,
				deferEvaluation : true,
				owner : this
			}).trackHasItems();

		/**
		 * Whether files are loaded
		 * @type {boolean}
		 */
		this.isLoadedListOfFileSpec = ko.observable(false);

		/**
		 * A list of selected files
		 * @type {Array.<module:models/file-spec>}
		 */
		this.listOfSlcFileSpec = ko.computed({
				read : this.calcListOfSlcFileSpec,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Max size of a file, in bytes (10MB)
		 * @type {number}
		 */
		this.maxSizeOfFile = 10485760;

		/**
		 * Max size in megabytes
		 * @type {number}
		 */
		this.maxSizeOfFileInMb = this.maxSizeOfFile / 1024 / 1024;

		/**
		 * Whether are selected all files
		 * @type {boolean}
		 */
		this.isSlcAllFiles = ko.computed({
				read : this.calcIsSlcAllFiles,
				write : this.setIsSlcAllFiles,
				deferEvaluation : true,
				owner : this
			});
	};

	/** Select or unselect all files */
	exports.prototype.setIsSlcAllFiles = function (isSlc) {
		ko.unwrap(this.listOfFileSpec).forEach(function (tmpFileSpec) {
			tmpFileSpec.isSelected(isSlc);
		});
	};

	/**
	 * Update section after removing files
	 */
	exports.prototype.updateSectionAfterRemovingFiles = function (idOfSectionPattern) {
		switch (idOfSectionPattern) {
		case 'well-volume':
			this.getParent().isLoadedVolumes(false);
			this.getParent().loadVolumes();
			break;
		case 'well-sketch':
			this.getParent().sketchOfWell.isLoaded(false);
			this.getParent().sketchOfWell.load();
			break;
		case 'well-history':
			this.getParent().isLoadedHistoryList(false);
			this.getParent().loadWellHistoryList();
			break;
		}
	};

	/** Calculate a list of selected files */
	exports.prototype.calcListOfSlcFileSpec = function () {
		return ko.unwrap(this.listOfFileSpec).filter(function (elem) {
			return ko.unwrap(elem.isSelected);
		});
	};

	/** Delete selected files from this section */
	exports.prototype.removeSlcFileSpecs = function (tmpSelectedList) {
		// Need to send to the server (only ids - to define and remove files on the server)
		var tmpIdList = tmpSelectedList.map(function (elem) {
				return {
					id : elem.id
				};
			});

		var ths = this;

		// Remove from the server
		fileSpecService.deleteArray(ths.stageKey, ths.id, tmpIdList).done(function () {
			// If success
			// Remove from client file list (all selected files)
			tmpSelectedList.forEach(function (elem) {
				ths.listOfFileSpec.remove(elem);
				ths.updateSectionAfterRemovingFiles(ths.sectionPatternId);
			});
		});
	};

	/**
	 * Get file spec by id
	 * @param {string} idOfFileSpec
	 * @returns {module:models/file-spec}
	 */
	exports.prototype.getFileSpecById = function (idOfFileSpec) {
		return ko.unwrap(this.listOfFileSpec).filter(function (elem) {
			return elem.id === idOfFileSpec;
		})[0];
	};

	/**
	 * Delete file spec by id
	 * @param {string} idOfFileSpec
	 * @param {function} callback
	 */
	exports.prototype.deleteFileSpecById = function (idOfFileSpec, callback) {
		var ths = this;
		// Remove from server
		fileSpecService.deleteArray(this.stageKey, this.id, [{
					id : idOfFileSpec
				}
			]).done(function () {
			// If success
			// Remove from client file list if exists
			var removedFileSpec = ths.getFileSpecById(idOfFileSpec);
			if (removedFileSpec) {
				ths.listOfFileSpec.remove(removedFileSpec);
			}

			if (callback) {
				callback();
			}
		});
	};

	/** Save a file specification */
	exports.prototype.saveFileSpec = function (fileSpecToSave) {
		fileSpecService.put(this.stageKey, this.id, fileSpecToSave.id, fileSpecToSave.toPlainFileSpec());
	};

	/** Load list of file spec from the server */
	exports.prototype.loadListOfFileSpec = function () {
		console.log('load list of file specs');
		var ths = this;
		// Do not load if loaded already
		if (ko.unwrap(ths.isLoadedListOfFileSpec)) {
			// Unselect all files in this section
			var tmpListOfFileSpec = ko.unwrap(ths.listOfFileSpec);

			tmpListOfFileSpec.forEach(function (elem) {
				elem.isSelected(false);
			});

			return;
		}

		// Loaded files are unselected by default
		fileSpecService.get(ths.stageKey, this.id).done(function (r) {
			// Import data to objects
			ths.listOfFileSpec(importFileSpecs(r));
			// Set flag (do not load again)
			ths.isLoadedListOfFileSpec(true);
		});
	};

	/** Build a list for a view */
	exports.prototype.buildReadyListOfFileSpec = function () {
		var tmpList = ko.unwrap(this.listOfFileSpec);
		return tmpList.sort(function (a, b) {
			return b.createdUnixTime - a.createdUnixTime;
		});
	};

	/** Calculate a pattern id for this section */
	exports.prototype.calcSectionPattern = function () {
		var tmpListOfSectionPattern = ko.unwrap(this.getParent().stagePatterns);
		var tmpSectionPatternId = this.sectionPatternId;
		var byId = tmpListOfSectionPattern.filter(function (arrElem) {
				return arrElem.id === tmpSectionPatternId;
			});

		if (byId.length === 1) {
			return byId[0];
		}
	};

	/** Calculate whether this section is visible as a view */
	exports.prototype.calcIsVisibleAsView = function () {
		var tmpSectionPattern = ko.unwrap(this.sectionPattern);
		var tmpIsVisible = ko.unwrap(this.isVisible);
		if (tmpSectionPattern) {
			return tmpSectionPattern.isView && tmpIsVisible;
		} else {
			return false;
		}
	};

	/** Get settings for file loader: only after defining of SectionPattern */
	exports.prototype.getSectionFiloader = function () {
		var ths = this;
		var progressInterval = 100; //https://github.com/blueimp/jQuery-File-Upload/wiki/Options
		var regExpString = ko.unwrap(ths.sectionPattern).fileTypeRegExp;
		var tmpMaxSizeOfFile = this.maxSizeOfFile;
		return {
			url : fileSpecService.getUrl(ths.stageKey, this.id),
			addCallback : function (data) {
				var tmpFile = data.files[0];
				if (!tmpFile) {
					throw new Error('No file is selected');
				}

				// data._progress is changed automatically
				var tmpPreFile = new PreFile(tmpFile.name,
						tmpFile.size,
						tmpFile.type,
						regExpString,
						tmpMaxSizeOfFile,
						function () {
						data.abort();
					});

				ths.listOfPreFile.push(tmpPreFile);

				console.log('tmpPreFile', tmpPreFile, data);

				// If a file is not success
				if (tmpPreFile.isSuccess === false) {
					return;
				}

				console.log('successful upload');

				// Update progress percent
				var progressIntervalId = window.setInterval(function () {
						//var tmpProgressPercent = parseInt((data._progress.loaded / data._progress.total) * 100, 10);

						// if (appHelper.isNumeric(tmpProgressPercent)) {
						// tmpPreFile.progressPercent(tmpProgressPercent);
						// } else {
						// // Check warnings, may be Nan
						// console.log(tmpProgressPercent + ' is not a number');
						// }

						tmpPreFile.bytesLoaded(data._progress.loaded);

						// Stop the time when fully loaded
						if (data._progress.loaded === tmpPreFile.size) {
							window.clearInterval(progressIntervalId);
						}
					}, progressInterval);

				data.submit()
				.done(function (result) {
					// Remove from pre files
					ths.listOfPreFile.remove(tmpPreFile);
					// Insert to the main list of files
					ths.listOfFileSpec.push(new FileSpec(result[0]));
				})
				.fail(function (jqXhr, textStatus, errorThrown) {
					window.clearInterval(progressIntervalId);
					if (textStatus === 'abort') {
						ths.listOfPreFile.remove(tmpPreFile);
					} else {
						console.log(jqXhr, textStatus, errorThrown);
						alert(textStatus + ': ' + jqXhr.responseText + ' (' + errorThrown + ')');
					}
				});

			}
		};
	};

	/**
	 * Remove a pre-file
	 */
	exports.prototype.removePreFile = function (preFileToRemove) {
		console.log('remove a pre file');
		this.listOfPreFile.remove(preFileToRemove);
	};

	/** Calculate, whether all file are selected */
	exports.prototype.calcIsSlcAllFiles = function () {
		var tmpList = ko.unwrap(this.listOfFileSpec);
		// If no files - false
		if (tmpList.length === 0) {
			return false;
		}

		// If there is at least one unselected file - false
		return (tmpList.filter(function (tmpFileSpec) {
				return (ko.unwrap(tmpFileSpec.isSelected) === false);
			}).length === 0);
	};

	return exports;
});
