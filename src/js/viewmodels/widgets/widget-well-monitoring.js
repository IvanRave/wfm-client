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

    var koListOfMonitoredParams = vwmWell.mdlStage.listOfMonitoredParams;
    
		this.widgetVwmMonitoringOfWell = new VwmMonitoringOfWell(vwmWell.mdlStage, koListOfMonitoredParams, 
      mdlWidget.opts.startUnixTime, 
      mdlWidget.opts.endUnixTime);
    
    // TODO: #23! Load after initialization -> init graph redrawing
	};

	/** Inherit from a widget viewmodel */
	appHelper.inherits(exports, VwmWidget);

	return exports;
});
