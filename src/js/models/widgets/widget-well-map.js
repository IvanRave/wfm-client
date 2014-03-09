/** @module */
define(['knockout',
		'helpers/app-helper',
		'models/widget'],
	function (ko,
		appHelper,
		Widget) {
	'use strict';

	/**
	 * Base: widget model for map of well
	 * @constuctor
	 * @augments {module:models/widget}
	 */
	var exports = function (data, widgockItem) {
		Widget.call(this, data, widgockItem);
	};

	/** Inherit from a widget model */
	appHelper.inherits(exports, Widget);

	/** Convert to plain JSON to send to the server as widget settings */
	exports.prototype.toPlainOpts = function () {
		return JSON.stringify({});
	};

	return exports;
});
