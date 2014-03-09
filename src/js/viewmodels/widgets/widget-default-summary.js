/** @module */
define(['knockout',
		'helpers/app-helper',
		'viewmodels/widget'],
	function (ko,
		appHelper,
		VwmWidget) {
	'use strict';

	/**
	 * Widget for summary info: for all stages
	 * @constructor
	 * @augments {module:viewmodels/widget}
	 */
	var exports = function (mdlWidget) {    
		VwmWidget.call(this, mdlWidget);
	};

  /** Inherit from a widget viewmodel */
	appHelper.inherits(exports, VwmWidget);

	return exports;
});
