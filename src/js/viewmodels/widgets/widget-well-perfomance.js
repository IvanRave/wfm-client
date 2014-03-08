/** @module */
define(['knockout',
		'viewmodels/perfomance-of-well',
		'helpers/app-helper',
		'viewmodels/widget'],
	function (ko,
		VwmPerfomanceOfWell,
		appHelper,
		VwmWidget) {
	'use strict';

	/**
	 * A perfomance widget
	 * @constructor
	 * @augments {module:viewmodels/widget}
	 */
	var exports = function (mdlWidget, opts, vwmWell) {
		VwmWidget.call(this, mdlWidget);

		opts = opts || {};

    /**
    * A viewmodel for perfomance
    * @type {module:viewmodels/perfomance-of-well}
    */
		this.vwmPerfomanceOfWell = new VwmPerfomanceOfWell({
				isVisibleForecastData : opts['IsVisibleForecastData'],
				selectedAttrGroupId : opts['SelectedAttrGroupId'],
				endYear : opts['EndYear'],
				startYear : opts['StartYear'],
				endMonth : opts['EndMonth'],
				startMonth : opts['StartMonth']
			}, vwmWell.mdlStage.perfomanceOfWell, vwmWell);
	};

	/** Inherit from a widget viewmodel */
	appHelper.inherits(exports, VwmWidget);

  /** Convert to string */
	exports.prototype.toStringifyOpts = function () {
		return JSON.stringify({
			'SelectedAttrGroupId' : ko.unwrap(this.vwmPerfomanceOfWell['selectedAttrGroupId']),
			'IsVisibleForecastData' : ko.unwrap(this.vwmPerfomanceOfWell['isVisibleForecastData']),
			'EndYear' : ko.unwrap(this.vwmPerfomanceOfWell['WPDDateEndYear']),
			'StartYear' : ko.unwrap(this.vwmPerfomanceOfWell['WPDDateStartYear']),
			'EndMonth' : ko.unwrap(this.vwmPerfomanceOfWell['WPDDateEndMonth']),
			'StartMonth' : ko.unwrap(this.vwmPerfomanceOfWell['WPDDateStartMonth'])
		});
	};

	return exports;
});
