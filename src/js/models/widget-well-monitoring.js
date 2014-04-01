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
	var exports = function (data, widgockItem, mdlStageContext) {
		Widget.call(this, data, widgockItem, mdlStageContext);

		var tmpOpts = JSON.parse(data.Opts);
		// todo: #23! Load after initialization -> init graph redrawing
		this.opts.startUnixTime = ko.observable(tmpOpts['startUnixTime']);
		this.opts.endUnixTime = ko.observable(tmpOpts['endUnixTime']);
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
