/** @module */
define(['knockout', 'viewmodels/well-history'], function (ko, WellHistoryViewModel) {
    'use strict';

    /** History widget with date filter, asc or desc */
    var exports = function (opts, koHistoryList) {
        opts = opts || {};

        var ths = this;

        this.historyView = new WellHistoryViewModel(opts, koHistoryList);

        this.toPlainOpts = function () {
            return {
                'StartDate': ko.unwrap(ths.historyView['startDate']),
                'EndDate': ko.unwrap(ths.historyView['endDate']),
                'SortByDateOrder': ko.unwrap(ths.historyView['sortByDateOrder']),
                'JobTypeId': ko.unwrap(ths.historyView['jobTypeId'])
            };
        };
    };

    return exports;
});