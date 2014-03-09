/** @module */
define(['knockout',
		'helpers/app-helper',
		'viewmodels/widget'],
	function (ko,
		appHelper,
		VwmWidget) {
	'use strict';

	/**
	 * Base: widget view model for map of well
	 * @constuctor
	 * @augments {module:viewmodels/widget}
	 */
	var exports = function (mdlWidget) {
		VwmWidget.call(this, mdlWidget);
	};

	/** Inherit from a widget viewmodel */
	appHelper.inherits(exports, VwmWidget);

	return exports;
});
