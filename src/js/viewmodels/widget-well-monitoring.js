/** @module */
define(['knockout',
		'viewmodels/monitoring-of-well',
		'helpers/app-helper',
		'base-viewmodels/widget-base'],
	function (ko,
		VwmMonitoringOfWell,
		appHelper,
		VwmWidget) {
	'use strict';

	/**
	 * A monitoring widget
	 * @constructor
	 * @augments {module:base-viewmodels/widget-base}
	 */
	var exports = function (mdlWidget) {
		VwmWidget.call(this, mdlWidget);
    
		this.widgetVwmMonitoringOfWell = new VwmMonitoringOfWell(mdlWidget.mdlStageContext,
      mdlWidget.opts.startUnixTime, 
      mdlWidget.opts.endUnixTime);
	};

	/** Inherit from a widget viewmodel */
	appHelper.inherits(exports, VwmWidget);

	return exports;
});
