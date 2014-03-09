/** @module */
define(['knockout',
		'viewmodels/monitoring-of-well',
		'helpers/app-helper',
		'viewmodels/widget'],
	function (ko,
		VwmMonitoringOfWell,
		appHelper,
		VwmWidget) {
	'use strict';

	/**
	 * A monitoring widget
	 * @constructor
	 * @augments {module:viewmodels/widget}
	 */
	var exports = function (mdlWidget, vwmWell) {
		VwmWidget.call(this, mdlWidget);
    
		this.widgetVwmMonitoringOfWell = new VwmMonitoringOfWell(vwmWell.mdlStage,
      mdlWidget.opts.startUnixTime, 
      mdlWidget.opts.endUnixTime);
    
    // TODO: #43! Load after initialization -> init graph redrawing
    mdlWidget.opts.startUnixTime.valueHasMutated();
	};

	/** Inherit from a widget viewmodel */
	appHelper.inherits(exports, VwmWidget);

	return exports;
});
