/** @module */
define(['knockout', 'viewmodels/scope-of-history-of-well'], function (ko, VwmScopeOfHistoryOfWell) {
    'use strict';

    /** History widget with date filter, asc or desc */
    var exports = function (opts, koHistoryList, koJobTypeList) {
        opts = opts || {};

        var ths = this;

        this.vwmScopeOfHistoryOfWell = new VwmScopeOfHistoryOfWell(opts, koHistoryList, koJobTypeList);
            //WellHistoryViewModel(opts, koHistoryList);

        this.toStringifyOpts = function () {
            return JSON.stringify({
                'StartDate': ko.unwrap(ths.vwmScopeOfHistoryOfWell['startDate']),
                'EndDate': ko.unwrap(ths.vwmScopeOfHistoryOfWell['endDate']),
                'SortByDateOrder': ko.unwrap(ths.vwmScopeOfHistoryOfWell['sortByDateOrder']),
                'JobTypeId': ko.unwrap(ths.vwmScopeOfHistoryOfWell['jobTypeId'])
            });
        };
    };

    return exports;
});