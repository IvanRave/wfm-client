/** @module */
define(['knockout',
		'helpers/app-helper',
		'viewmodels/widget'],
	function (ko,
		appHelper,
		VwmWidget) {
	'use strict';

	/**
	 * Viewmodel: widget for sketch (image plus desc)
	 * @constructor
	 * @augments {module:viewmodels/widget}
	 */
	var exports = function (mdlWidget, opts) {
		VwmWidget.call(this, mdlWidget);

		opts = opts || {};

		this.isVisImg = ko.observable(opts['IsVisImg']);
		this.isVisDescription = ko.observable(opts['IsVisDescription']);
	};

	/** Inherit from a widget viewmodel */
	appHelper.inherits(exports, VwmWidget);

	/** Convert to plain JSON to send to the server as widget settings */
	exports.prototype.toStringifyOpts = function () {
		return JSON.stringify({
			'IsVisImg' : ko.unwrap(this.isVisImg),
			'IsVisDescription' : ko.unwrap(this.isVisDescription)
		});
	};

	return exports;
});
