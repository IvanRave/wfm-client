define(['knockout'], function (ko) {
    'use strict';

    /**
    * Viewmodel: history of well
    * @constructor
    */
    var exports = function (mdlHistoryOfWell, vwmWell, koStartUnixTime, koEndUnixTime, koIdOfJobType) {

        var ths = this;

        /**
        * Model: history of well
        * @type {<module:models/history-of-well>}
        */
        this.mdlHistoryOfWell = mdlHistoryOfWell;

        /**
        * Whether history record is visible (filtered)
        * @type {boolean}
        */
        this.isVisible = ko.computed({
            read: function () {
                var tmpFilterUnixTime = {
                    start: ko.unwrap(koStartUnixTime),
                    end: ko.unwrap(koEndUnixTime)
                };

                // Step 1: filter by date
                if (tmpFilterUnixTime.start || tmpFilterUnixTime.end) {
                    var tmpElemUnixTime = {
                        start: ko.unwrap(ths.mdlHistoryOfWell.startUnixTime),
                        end: ko.unwrap(ths.mdlHistoryOfWell.endUnixTime)
                    };

                    if (tmpFilterUnixTime.start && (new Date(tmpFilterUnixTime * 1000) > new Date(tmpElemUnixTime.start * 1000))) {
                        return false;
                    }

                    if (tmpFilterUnixTime.end && (new Date(tmpFilterUnixTime.end * 1000) < new Date(tmpElemUnixTime.end * 1000))) {
                        return false;
                    }
                }

                // Step 2: filter by job type
                var tmpIdOfJobType = ko.unwrap(koIdOfJobType);

                if (tmpIdOfJobType) {
                    if (ko.unwrap(ths.mdlHistoryOfWell.jobTypeId) !== tmpIdOfJobType) {
                        return false;
                    }
                }

                return true;
            },
            deferEvaluation: true
        });

        /**
        * Create file spec for history of well
        */
        this.createFileSpecOfHistoryOfWell = function () {
            // Select file section with history files (load and unselect files)
            vwmWell.unzOfSlcVwmSectionFmg('well-history');
            var fmgr = vwmWell.fmgr;
            // Calback for selected file
            function mgrCallback() {
                fmgr.okError('');

                var tmpSlcVwmSection = ko.unwrap(vwmWell.slcVwmSectionFmg);

                if (!tmpSlcVwmSection) { throw new Error('No selected section'); }

                // Select file from file manager
                var selectedFileSpecs = ko.unwrap(tmpSlcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
                    return ko.unwrap(elem.isSelected);
                });

                if (selectedFileSpecs.length !== 1) {
                    fmgr.okError('need to select one file');
                    return;
                }

                ths.mdlHistoryOfWell.postFileSpecOfHistoryOfWell(selectedFileSpecs[0].id, function () {
                    fmgr.hide();
                }, function (jqXhr) {
                    if (jqXhr.status === 422) {
                        var resJson = jqXhr.responseJSON;
                        require(['helpers/lang-helper'], function (langHelper) {
                            var tmpProcessError = (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
                            fmgr.okError(tmpProcessError);
                        });
                    }
                });
            }

            // Add to observable
            fmgr.okCallback(mgrCallback);

            // Notification
            fmgr.okDescription('Please select a file for this history record');

            // Open file manager
            fmgr.show();
        };

        this.createImageFromFileSpec = function () {
            // TODO:
            // vwmWell.mdlStage.createImageFromFileSpec

        };
    };

    return exports;
});