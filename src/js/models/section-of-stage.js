/** @module */
define(['knockout',
		'models/file-spec',
		'services/file-spec',
		'models/pre-file'],
	function (
		ko,
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
		 * Whether any file is selected: to activate delete button or smth else
		 * @type {boolean}
		 */
		this.isSelectedAnyFile = ko.computed({
				read : this.calcIsSelectedAnyFile,
				deferEvaluation : true,
				owner : this
			});
	};

	/** Calculate whether any file is selected */
	exports.prototype.calcIsSelectedAnyFile = function () {
		return ko.unwrap(this.listOfSlcFileSpec).length > 0;
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
	exports.prototype.deleteSelectedFileSpecs = function () {
		// Choose selected files
		var tmpSelectedList = ko.unwrap(this.listOfSlcFileSpec);

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
		var maxSizeOfFile = 10485760; // bytes - 10MB
		var regExpString = ko.unwrap(ths.sectionPattern).fileTypeRegExp;
		var tmpRegExp = new RegExp(regExpString);
		return {
			url : fileSpecService.getUrl(ths.stageKey, this.id),
			addCallback : function (data) {
				var tmpFile = data.files[0];
				if (!tmpFile) {
					throw new Error('No file is selected');
				}

        // data._progress is changed automatically
				var tmpPreFile = new PreFile(tmpFile.name, tmpFile.size, tmpFile.type, data._progress);
				ths.listOfPreFile.push(tmpPreFile);

				// Error scope
				var errScope = [];
				// Check size of all files
				data.files.forEach(function (tmpFile) {
					if (tmpFile.size > maxSizeOfFile) {
						errScope.push('Max size of file: 10MB (' + tmpFile.name + ')');
					}

					if (tmpRegExp.test(tmpFile.type) === false) {
						// Alert. Remove metacharacters from regexp and divide to normal representation
						errScope.push(tmpFile.name + ': file type (' + (tmpFile.type || 'empty') + ') is not supported. Supported types: ' + regExpString.replace(/[\\,\$,\^]/g, '').split('|').join(', '));
					}
				});

				if (errScope.length > 0) {
					alert('File errors: \n' + errScope.join('\n'));
					return;
				}

				data.submit()
				.done(function (result) {
					ths.listOfFileSpec.push(new FileSpec(result[0]));
				})
				.fail(function (jqXHR, textStatus, errorThrown) {
					alert(textStatus + ': ' + jqXHR.responseText + ' (' + errorThrown + ')');
				});
			}
		};
	};

	return exports;
});
