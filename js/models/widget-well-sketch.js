/** @module */
define(['knockout',
		'helpers/app-helper',
		'base-models/widget-base'],
	function (ko,
		appHelper,
		Widget) {
	'use strict';

	/**
	 * Model: widget for sketch (image plus desc)
	 * @constructor
	 * @augments {module:base-models/widget-base}
	 */
	var exports = function (data, widgockItem) {
		Widget.call(this, data, widgockItem);

		var tmpOpts = JSON.parse(data.Opts);

		/**
		 * Widget options
		 * @enum {Object.<string, Object>}
		 */
		this.opts = {
			/**
			 * Whether the skech image is visible
			 * @type {boolean}
			 */
			isVisImg : ko.observable(tmpOpts['isVisImg']),
			/**
			 * Whether the description is visible
			 * @type {boolean}
			 */
			isVisDescription : ko.observable(tmpOpts['isVisDescription'])
		};
	};

	/** Inherit from a widget model */
	appHelper.inherits(exports, Widget);

	/** Convert to plain JSON to send to the server as widget settings */
	exports.prototype.toPlainOpts = function () {
		return ko.toJSON(this.opts);
	};

	return exports;
});
