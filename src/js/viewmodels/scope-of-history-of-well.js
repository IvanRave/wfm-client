/** @module */
define(['knockout',
    'viewmodels/history-of-well'],
    function (ko,
        VwmHistoryOfWell) {
        'use strict';

        /**
        * Well history view for history section, report section and history widgets
        * @constructor
        */
        var exports = function (opts, vwmWell) {
            var ths = this;

            /** Company model for this well */
            var mdlCompany = vwmWell.mdlStage.getWellGroup().getWellField().getWellRegion().getCompany();

            /**
            * Link to company job type list (observable)
            */
            this.jobTypeList = mdlCompany.jobTypeList;

            this.goToPostingJobType = function () {
                var jobTypeNewName = window.prompt('{{capitalizeFirst lang.toAddJobTypeToList}}');
                if (jobTypeNewName) {
                    mdlCompany.postJobType(jobTypeNewName);
                }
            };

            // UTC unix time (in seconds)
            this.startDate = ko.observable(opts['StartDate']);
            this.endDate = ko.observable(opts['EndDate']);

            this.jobTypeId = ko.observable(opts['JobTypeId']);

            this.sortByDateOrder = ko.observable(opts['SortByDateOrder'] || -1);

            this.sortByDateCss = ko.computed({
                read: function () {
                    return ko.unwrap(ths.sortByDateOrder) === 1 ? 'glyphicon-arrow-down' : 'glyphicon-arrow-up';
                },
                deferEvaluation: true
            });

            this.changeSortByDateOrder = function () {
                ths.sortByDateOrder(-parseInt(ko.unwrap(ths.sortByDateOrder), 10));
            };

            this.listOfVwmHistoryOfWell = ko.computed({
                read: function () {
                    var tmpMdlList = ko.unwrap(vwmWell.mdlStage.historyList);
                    return tmpMdlList.map(function (elem) {
                        return new VwmHistoryOfWell(elem, vwmWell, ths.startDate, ths.endDate, ths.jobTypeId);
                    });               
                },
                deferEvaluation: true
            });

            /**
            * Sorted list of history records
            *    Separated from main list, to prevent recreation of this list
            * @type {Array.<module:viewmodels/history-of-well>}
            */
            this.sortedListOfVwmHistoryOfWell = ko.computed({
                read: function () {
                    var tmpVwmList = ko.unwrap(ths.listOfVwmHistoryOfWell);

                    var tmpOrder = parseInt(ko.unwrap(ths.sortByDateOrder), 10);

                    return tmpVwmList.sort(function (left, right) {
                        return ko.unwrap(left.mdlHistoryOfWell.startUnixTime) === ko.unwrap(right.mdlHistoryOfWell.startUnixTime) ? 0 :
                            (ko.unwrap(left.mdlHistoryOfWell.startUnixTime) > ko.unwrap(right.mdlHistoryOfWell.startUnixTime) ? tmpOrder : -tmpOrder);
                    });
                },
                deferEvaluation: true
            });

            this.wellHistoryNew = {
                startUnixTime: ko.observable(),
                endUnixTime: ko.observable()
            };

            this.isEnabledPostHistoryOfWell = ko.computed({
                read: function () {
                    if (ko.unwrap(ths.wellHistoryNew.startUnixTime)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                },
                deferEvaluation: true
            });

            this.postVwmHistoryOfWell = function () {
                if (ko.unwrap(ths.isEnabledPostHistoryOfWell)) {
                    var wellHistoryNewData = ko.toJS(ths.wellHistoryNew);

                    if (wellHistoryNewData.startUnixTime) {
                        if (!wellHistoryNewData.endUnixTime) {
                            wellHistoryNewData.endUnixTime = wellHistoryNewData.startUnixTime;
                        }

                        vwmWell.mdlStage.postHistoryOfWell(wellHistoryNewData.startUnixTime,
                            wellHistoryNewData.endUnixTime, function () {
                                // Set to null for psblty creating new well history
                                ths.wellHistoryNew.startUnixTime(null);
                                ths.wellHistoryNew.endUnixTime(null);
                            });
                    }
                }
            };

            /**
            * Remove history record: model and viewmodel
            */
            this.removeVwmHistoryOfWell = function (vwmHistoryOfWellToRemove) {
                if (confirm('{{capitalizeFirst lang.confirmToDelete}} record?')) {
                    vwmWell.mdlStage.deleteWellHistory(vwmHistoryOfWellToRemove.mdlHistoryOfWell);
                }
            };
        };

        return exports;
    });