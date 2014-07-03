/** @module */
define(['knockout',
		'viewmodels/file-spec'],
	function (ko,
		VwmFileSpec) {
	'use strict';

	/**
	 * View model of section of stage (company-sections --- well sections)
	 * @constructor
	 * @param {module:models/section-of-stage} mdlSection - Section model with data
	 * @param {object} vwmStage - Stage view, which may have sections (company ... well)
	 */
	var exports = function (mdlSection, vwmStage) {
		/**
		 * Section data model
		 * @type {module:models/section-of-stage}
		 */
		this.mdlSection = mdlSection;

		/** Section identificator: to calculate selected (by default) section */
		this.unz = mdlSection.sectionPatternId;

		/**
		 * A list of viewmodels of file specifications
		 * @type {Array.<module:viewmodels/file-spec>}
		 */
		this.listOfVwmFileSpec = ko.computed({
				read : this.buildListOfVwmFileSpec,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * A sorting order, be default is DESC
		 * @type {number}
		 */
		this.fileSortOrder = ko.observable(-1);

		/**
		 * A sorting property
		 * @type {string}
		 */
		this.fileSortProp = ko.observable('createdUnixTime');

		/**
		 * A part of a name of the file to filter
		 * @type {string}
		 */
		this.fileFilterName = ko.observable('');

		/**
		 * A list of sorted and filtered files
		 * @type {Array.<module:viewmodels/file-spec>}
		 */
		this.sortedListOfVwmFileSpec = ko.computed({
				read : this.buildSortedListOfVwmFileSpec,
				deferEvaluation : true,
				owner : this
			}).trackHasItems();

		/**
		 * Only one selected file (is more than one - null)
		 * @type {module:models/file-spec}
		 */
		this.oneVisibleSlcVwmFileSpec = ko.computed({
				read : this.calcOneVisibleSlcVwmFileSpec,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Whether any file is selected: to activate delete button or smth else
		 * @type {boolean}
		 */
		this.isVisibleSlcAnyFile = ko.computed({
				read : this.calcIsVisibleSlcAnyFile,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Whether section is selected
		 * @type {boolean}
		 */
		this.isSlcVwmSectionWrk = ko.computed({
				read : function () {
					return (ko.unwrap(vwmStage.slcVwmSectionWrk) === this);
				},
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Whether this file section is selected (the same section, only for file manager)
		 * @type {boolean}
		 */
		this.isSlcVwmSectionFmg = ko.computed({
				read : function () {
					return (ko.unwrap(vwmStage.slcVwmSectionFmg) === this);
				},
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Name of the edited file
		 * @type {string}
		 */
		this.nameForEdit = ko.observable('');
	};

	/**
	 * Build a list of viewmodels of file specifications
	 * @returns {Array.<module:viewmodels/file-spec>}
	 */
	exports.prototype.buildListOfVwmFileSpec = function () {
		var tmpList = ko.unwrap(this.mdlSection.listOfFileSpec);
		return tmpList.map(function (mdlFileSpec) {
			return new VwmFileSpec(mdlFileSpec, this.fileFilterName);
		}, this);
	};

	exports.prototype.buildSortedListOfVwmFileSpec = function () {
		var tmpSortProp = ko.unwrap(this.fileSortProp);
		if (tmpSortProp) {
			var tmpSortOrder = ko.unwrap(this.fileSortOrder);

			var tmpListOfVwmFileSpec = ko.unwrap(this.listOfVwmFileSpec);

			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
			var tmpListForSorting = tmpListOfVwmFileSpec.map(function (vwmItem, i) {
					var tmpValue = ko.unwrap(vwmItem.mdlFileSpec[tmpSortProp]);

					if (tmpSortProp === 'name') {
						tmpValue = tmpValue.toLowerCase();
					}

					return {
						index : i,
						value : tmpValue
					};
				});

			var sortedList = tmpListForSorting.sort(function (a, b) {
					if (a.value > b.value) {
						return tmpSortOrder;
					} else {
						return -tmpSortOrder;
					}
				});

			// A ready list
			return sortedList.map(function (sortedItem) {
				return tmpListOfVwmFileSpec[sortedItem.index];
			});
		}
	};

	exports.prototype.sortByName = function () {
		this.fileSortProp('name');
		this.fileSortOrder(1);
	};

	exports.prototype.sortBySize = function () {
		this.fileSortProp('length');
		this.fileSortOrder(1);
	};

	exports.prototype.sortByCreated = function () {
		this.fileSortProp('createdUnixTime');
		this.fileSortOrder(-1);
	};

	/**
	 * Calculate only one selected file
	 * @returns {module:models/file-spec}
	 */
	exports.prototype.calcOneVisibleSlcVwmFileSpec = function () {
		var tmpList = ko.unwrap(this.listOfVwmFileSpec);

		var tmpVisibleSlcList = tmpList.filter(function (vwmItem) {
				return (ko.unwrap(vwmItem.isVisible) && ko.unwrap(vwmItem.mdlFileSpec.isSelected));
			});

		if (tmpVisibleSlcList.length === 1) {
			return tmpVisibleSlcList[0];
		}
		// else - null, need only one file to download or edit or smth else
	};

	/** Calculate whether any file is selected */
	exports.prototype.calcIsVisibleSlcAnyFile = function () {
		var tmpList = ko.unwrap(this.listOfVwmFileSpec);

		var tmpVisibleSlcList = tmpList.filter(function (vwmItem) {
				return (ko.unwrap(vwmItem.isVisible) && ko.unwrap(vwmItem.mdlFileSpec.isSelected));
			});

		return tmpVisibleSlcList.length > 0;
	};

	/**
	 * Remove selected and visible files
	 */
	exports.prototype.removeSlcVwmFileSpecs = function () {
		var tmpList = ko.unwrap(this.listOfVwmFileSpec);

		var tmpVisibleSlcList = tmpList.filter(function (vwmItem) {
				return (ko.unwrap(vwmItem.isVisible) && ko.unwrap(vwmItem.mdlFileSpec.isSelected));
			});

		var mdlList = tmpVisibleSlcList.map(function (vwmItem) {
				return vwmItem.mdlFileSpec;
			});

		// Send to the model
		this.mdlSection.removeSlcFileSpecs(mdlList);
	};

	/** Edit a file */
	exports.prototype.editVwmFileSpec = function () {
		var oneFile = ko.unwrap(this.oneVisibleSlcVwmFileSpec);
		if (!oneFile) {
			return;
		}

		this.nameForEdit(ko.unwrap(oneFile.mdlFileSpec.name));
		oneFile.isEditView(true);
    oneFile.hasInputFocus(true);
	};

	/** Save a name of the file spec */
	exports.prototype.saveVwmFileSpec = function (vwmFileSpecToSave, e) {
		// Escape
		if (((e.type === 'keydown') && (e.keyCode === 27)) || (e.type === 'blur')) {
			vwmFileSpecToSave.isEditView(false);
      return false;
		}

    // Tab or Enter
		if ((e.type === 'keydown') && (e.keyCode === 13 || e.keyCode === 9)) {
      var newName = e.currentTarget.value;
    
      console.log('newName', newName);

			if (newName) {
				var tmpMdlFileSpec = vwmFileSpecToSave.mdlFileSpec;

				// If file name is unchanged - don't save
				if (newName !== ko.unwrap(tmpMdlFileSpec.name)) {
          console.log('saved file spec');
					// Change a name of the model
					tmpMdlFileSpec.name(newName);

					// Save through the model
					this.mdlSection.saveFileSpec(tmpMdlFileSpec);
				}
			}

			// Turn off editing
      vwmFileSpecToSave.isEditView(false);
      
      return false;
		}
    
    return true;
	};

	return exports;
});
