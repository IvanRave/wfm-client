/** @module */
define(['knockout'], function (ko) {
	'use strict';

	/**
	 * View model for wfm parameter of well group
	 * @constructor
	 */
	var exports = function (mdlWfmParameterOfWroup) {

		/**
		 * Model: wfm parameter of well group
		 * @type {module:models/wfm-parameter-of-wroup}
		 */
		this.mdlWfmParameterOfWroup = mdlWfmParameterOfWroup;

		/**
		 * Whether parameter is visible on the test or perfomance page
		 * @type {boolean}
		 */
		this.isVisible = ko.observable(true);
	};

	return exports;
});
