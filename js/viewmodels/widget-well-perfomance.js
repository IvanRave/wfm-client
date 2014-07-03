/** @module */
define(['knockout',
		'viewmodels/perfomance-of-well',
		'helpers/app-helper',
		'base-viewmodels/widget-base'],
	function (ko,
		VwmPerfomanceOfWell,
		appHelper,
		VwmWidget) {
	'use strict';

	/**
	 * A perfomance widget
	 * @constructor
	 * @augments {module:base-viewmodels/widget-base}
	 */
	var exports = function (mdlWidget) {
		VwmWidget.call(this, mdlWidget);    
    
		/**
		 * A viewmodel for perfomance
     *    Viewmodel can't be in a model: any viewmodel initializes only in other viewmodels
		 * @type {module:viewmodels/perfomance-of-well}
		 */
		this.vwmPerfomanceOfWell = new VwmPerfomanceOfWell(mdlWidget.mdlStageContext,
        null,
				mdlWidget.opts.startYear,
				mdlWidget.opts.endYear,
				mdlWidget.opts.startMonth,
				mdlWidget.opts.endMonth,
				mdlWidget.opts.selectedAttrGroupId,
				mdlWidget.opts.isVisibleForecastData);
	};

	/** Inherit from a widget viewmodel */
	appHelper.inherits(exports, VwmWidget);

	return exports;
});
