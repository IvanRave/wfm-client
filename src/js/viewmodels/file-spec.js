/** @module */
define(['knockout',
		'helpers/app-helper'],
	function (ko,
		appHelper) {
	'use strict';

	/**
	 * File specification viewmodel
	 * @constructor
	 */
	var exports = function (mdlFileSpec, koFileFilterName) {
		/**
		 * A model of the file spec
		 * @type {module:models/file-spec}
		 */
		this.mdlFileSpec = mdlFileSpec;

		/**
		 * A filter for a file name
		 * @type {string}
		 */
		this.fileFilterName = koFileFilterName;

		/**
		 * Whether the file is visible (filtered)
		 * @type {boolean}
		 */
		this.isVisible = ko.computed({
				read : this.calcIsVisible,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Whether the file in edit mode
		 * @type {boolean}
		 */
		this.isEditView = ko.observable(false);
    
    /**
    * Whether the input has a focus
    * @todo #34! doesn't work for file spec records
    * @type {boolean}
    */
    this.hasInputFocus = ko.observable(false);
	};

	/**
	 * Calculate, whether the file is visible
	 * @returns {boolean}
	 */
	exports.prototype.calcIsVisible = function () {
		var tmpFileFilterName = ko.unwrap(this.fileFilterName);
		// If no filter string, then the file is visible
		if (!tmpFileFilterName) {
			return true;
		}

		var tmpFileSpecName = ko.unwrap(this.mdlFileSpec.namePlusExtension).toLowerCase();
		return tmpFileSpecName.indexOf(tmpFileFilterName.toLowerCase()) >= 0;
	};

	/** Download file */
	exports.prototype.download = function () {
		appHelper.downloadURL(this.mdlFileSpec.fileUrl);
	};

	return exports;
});
