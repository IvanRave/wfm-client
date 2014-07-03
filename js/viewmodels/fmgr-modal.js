/** @module */
define(['knockout'], function (ko) {
	'use strict';

	/**
	 * A model for a file manager modal window
	 * @constructor
	 */
	var exports = function () {
		/**
		 * Whether the window is opened
		 * @type {boolean}
		 */
		this.isShowed = ko.observable(false);

		/**
		 * Description for an Ok button
		 * @type {string}
		 */
		this.okDescription = ko.observable('');

		/**
		 * An error message for the Ok button
		 * @type {string}
		 */
		this.okError = ko.observable('');

		/**
		 * Callback for the Ok button
		 * @type {Function}
		 */
		this.okCallback = ko.observable();
	};

	/** Show a window */
	exports.prototype.show = function () {
		this.isShowed(true);
	};

	/** Hide a window */
	exports.prototype.hide = function () {
		this.isShowed(false);
		this.okDescription('');
		this.okError('');
		this.okCallback(null);
	};

	return exports;
});
