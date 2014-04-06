/** @module */
define(['knockout',
		'helpers/app-helper',
		'base-models/widget-base'],
	function (ko,
		appHelper,
		Widget) {
	'use strict';

	/**
	 * A monitoring widget
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
			 * Start monitoring
			 * @type {number}
			 */
			startUnixTime : ko.observable(tmpOpts['startUnixTime']),
			/**
			 * End monitoring
			 * @type {number}
			 */
			endUnixTime : ko.observable(tmpOpts['endUnixTime'])
		};
	};

	/** Inherit from a widget model */
	appHelper.inherits(exports, Widget);

	/**
	 * Convert to JSON string to save options on the server
	 */
	exports.prototype.toPlainOpts = function () {
		return ko.toJSON(this.opts);
	};

	return exports;
});
