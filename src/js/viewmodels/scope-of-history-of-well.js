﻿/** @module */
define(['jquery', 'knockout'], function ($, ko) {
    'use strict';

    /**
    * Well history view for history section, report section and history widgets
    * @constructor
    */
    var exports = function (opts, koHistoryList, koJobTypeList) {
        var vw = this;

        /**
        * Link to company job type list (observable)
        */
        vw.jobTypeList = koJobTypeList;

        // UTC unix time (in seconds)
        vw.startDate = ko.observable(opts['StartDate']);
        vw.endDate = ko.observable(opts['EndDate']);

        vw.jobTypeId = ko.observable(opts['JobTypeId']);

        vw.sortByDateOrder = ko.observable(opts['SortByDateOrder'] || -1);

        vw.sortByDateCss = ko.computed({
            read: function () {
                return ko.unwrap(vw.sortByDateOrder) === 1 ? 'glyphicon-arrow-down' : 'glyphicon-arrow-up';
            },
            deferEvaluation: true
        });

        vw.changeSortByDateOrder = function () {
            vw.sortByDateOrder(-parseInt(ko.unwrap(vw.sortByDateOrder), 10));
        };

        vw.sortedHistoryList = ko.computed(function () {
            var sortFilterArr = ko.unwrap(koHistoryList);

            // In unix time
            var tmpStartDate = ko.unwrap(vw.startDate),
                tmpEndDate = ko.unwrap(vw.endDate);

            if (tmpStartDate || tmpEndDate) {
                sortFilterArr = $.grep(sortFilterArr, function (elemValue) {
                    var tmpElemStartUnixTime = ko.unwrap(elemValue.startUnixTime);
                    if (tmpStartDate && (new Date(tmpStartDate * 1000) > new Date(tmpElemStartUnixTime * 1000))) {
                        return false;
                    }

                    var tmpElemEndUnixTime = ko.unwrap(elemValue.endUnixTime);

                    if (tmpEndDate && (new Date(tmpEndDate * 1000) < new Date(tmpElemEndUnixTime * 1000))) {
                        return false;
                    }

                    return true;
                });
            }

            var tmpJobTypeId = ko.unwrap(vw.jobTypeId);

            if (tmpJobTypeId) {
                sortFilterArr = $.grep(sortFilterArr, function (elemValue) {
                    return (ko.unwrap(elemValue.jobTypeId) === tmpJobTypeId);
                });
            }

            var tmpOrder = parseInt(ko.unwrap(vw.sortByDateOrder), 10);

            return sortFilterArr.sort(function (left, right) {
                return ko.unwrap(left.startUnixTime) === ko.unwrap(right.startUnixTime) ? 0 : (ko.unwrap(left.startUnixTime) > ko.unwrap(right.startUnixTime) ? tmpOrder : -tmpOrder);
            });
        });
    };

    return exports;
});