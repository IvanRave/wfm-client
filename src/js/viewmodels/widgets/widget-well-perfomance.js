/** @module */
define(['knockout',
  'viewmodels/perfomance-of-well'], 
  function (ko,
  VwmPerfomanceOfWell) {
    'use strict';

    // Subtype from Widget
    var exports = function (opts, widgockItem) {
        var ths = this;
        opts = opts || {};
        
        this.perfomanceView = new VwmPerfomanceOfWell({
            isVisibleForecastData: opts['IsVisibleForecastData'],
            selectedAttrGroupId: opts['SelectedAttrGroupId'],
            endYear: opts['EndYear'],
            startYear: opts['StartYear'],
            endMonth: opts['EndMonth'],
            startMonth: opts['StartMonth']
        }, widgockItem.getWidgout().getParent().perfomancePartial);

        this.toStringifyOpts = function () {
            return {
                'SelectedAttrGroupId': ko.unwrap(ths.perfomanceView['selectedAttrGroupId']),
                'IsVisibleForecastData': ko.unwrap(ths.perfomanceView['isVisibleForecastData']),
                'EndYear': ko.unwrap(ths.perfomanceView['WPDDateEndYear']),
                'StartYear': ko.unwrap(ths.perfomanceView['WPDDateStartYear']),
                'EndMonth': ko.unwrap(ths.perfomanceView['WPDDateEndMonth']),
                'StartMonth': ko.unwrap(ths.perfomanceView['WPDDateStartMonth'])
            };
        };
    };

    return exports;
});