/** @module */
define(['knockout',
		'helpers/app-helper',
		'base-viewmodels/widget-base'],
	function (ko,
		appHelper,
		VwmWidget) {
	'use strict';

	/**
	 * Viewmodel: widget for sketch (image plus desc)
	 * @constructor
	 * @augments {module:base-viewmodels/widget-base}
	 */
	var exports = function (mdlWidget) {
		VwmWidget.call(this, mdlWidget);
	};

	/** Inherit from a widget viewmodel */
	appHelper.inherits(exports, VwmWidget);

	return exports;
});
