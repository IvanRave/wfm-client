/** @module */
define(['knockout'],
	function (ko) {
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
		 * Whether the file in edit mode
		 * @type {boolean}
		 */
		this.isEditView = ko.observable(false);

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
	};

	/**
	 * Calculate, whether the file is visible
	 * @returns {boolean}
	 */
	exports.prototype.calcIsVisible = function () {
		var tmpFileFilterName = ko.unwrap(this.fileFilterName);
    // If no filter string, then the file is visible
    if (!tmpFileFilterName){
      return true;
    }
		var tmpFileSpecName = ko.unwrap(this.mdlFileSpec.name);
		return tmpFileSpecName.indexOf(tmpFileFilterName) >= 0;
	};

	return exports;
});
