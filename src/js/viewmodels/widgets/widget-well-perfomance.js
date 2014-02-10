/** @module */
define(['knockout',
  'viewmodels/perfomance-of-well'], 
  function (ko,
  VwmPerfomanceOfWell) {
    'use strict';

    // Subtype from Widget
    var exports = function (opts, vwmWell) {
        var ths = this;
        opts = opts || {};
        
        this.vwmPerfomanceOfWell = new VwmPerfomanceOfWell({
            isVisibleForecastData: opts['IsVisibleForecastData'],
            selectedAttrGroupId: opts['SelectedAttrGroupId'],
            endYear: opts['EndYear'],
            startYear: opts['StartYear'],
            endMonth: opts['EndMonth'],
            startMonth: opts['StartMonth']
        }, vwmWell.mdlStage.perfomanceOfWell, vwmWell);

        this.toStringifyOpts = function () {
            return JSON.stringify({
                'SelectedAttrGroupId': ko.unwrap(ths.vwmPerfomanceOfWell['selectedAttrGroupId']),
                'IsVisibleForecastData': ko.unwrap(ths.vwmPerfomanceOfWell['isVisibleForecastData']),
                'EndYear': ko.unwrap(ths.vwmPerfomanceOfWell['WPDDateEndYear']),
                'StartYear': ko.unwrap(ths.vwmPerfomanceOfWell['WPDDateStartYear']),
                'EndMonth': ko.unwrap(ths.vwmPerfomanceOfWell['WPDDateEndMonth']),
                'StartMonth': ko.unwrap(ths.vwmPerfomanceOfWell['WPDDateStartMonth'])
            });
        };
    };

    return exports;
});