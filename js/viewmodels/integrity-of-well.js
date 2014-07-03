/** @module */
define(['knockout'], function (ko) {
	'use strict';

	/**
	 * Viewmodel: integrity
	 * @constructor
	 */
	var exports = function (mdlIntegrity, koVidOfSlcVwmIntegrity) {

		var ths = this;

		this.mdlIntegrity = mdlIntegrity;

		/**
		 * Id of viewmodel = id of file spec (unique per well)
		 * @type {string}
		 */
		this.vid = mdlIntegrity.idOfFileSpec;

		/**
		 * Whether view model is selected
		 * @type {boolean}
		 */
		this.isSlc = ko.computed({
				read : function () {
					return ths.vid === ko.unwrap(koVidOfSlcVwmIntegrity);
				},
				deferEvaluation : true
			});
	};

	return exports;
});
