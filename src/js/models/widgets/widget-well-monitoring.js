/** @module */
define(['knockout',
		'helpers/app-helper',
		'models/widget'],
	function (ko,
		appHelper,
		Widget) {
	'use strict';

	/**
	 * A monitoring widget
	 * @constructor
	 * @augments {module:models/widget}
	 */
	var exports = function (data, widgockItem) {
		Widget.call(this, data, widgockItem);

		var tmpOpts = JSON.parse(data.Opts);
		// todo: #23! Load after initialization -> init graph redrawing
		this.opts.startUnixTime = ko.observable(tmpOpts['StartUnixTime']);

		this.opts.endUnixTime = ko.observable(tmpOpts['EndUnixTime']);
	};

	/** Inherit from a widget model */
	appHelper.inherits(exports, Widget);

	/**
	 * Convert to JSON string to save options on the server
	 */
	exports.prototype.toPlainOpts = function () {
		return ko.toJSON(this.opts);
		// return JSON.stringify({
		// 'StartUnixTime' : ko.unwrap(this.startUnixTime),
		// 'EndUnixTime' : ko.unwrap(this.endUnixTime)
		// });
	};

	return exports;
});
