/**
 * @module
 */
define(['knockout'], function (ko) {
	'use strict';

	/**
	 * Viewmodel: test scope
	 * @constructor
	 */
	var exports = function (mdlTestScope) {
		var ths = this;

		/**
		 * Model: test scope
		 * @type {module:models/test-scope}
		 */
		this.mdlTestScope = mdlTestScope;

		/**
		 * Whether test scope in detailed view
		 * @type {boolean}
		 */
		this.isDetailed = ko.observable(false);

		/**
		 * Toggle details
		 */
		this.toggleIsDetailed = function () {
			ths.isDetailed(!ko.unwrap(ths.isDetailed));
		};
	};

	return exports;
});
