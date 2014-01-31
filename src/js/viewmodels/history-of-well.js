define([
    'jquery',
    'knockout',
    'helpers/modal-helper'],
    function (
        $,
        ko,
        bootstrapModal) {
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
                vwmWell.unzOfSlcVwmSectionFmg(vwmWell.mdlStage.stageKey + '-history');
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

            /**
            * Create cropped image from file (for history of well)
            */
            this.createImageFromFileSpec = function () {
                vwmWell.unzOfSlcVwmSectionFmg(vwmWell.mdlStage.stageKey + '-history');
                var fmgr = vwmWell.fmgr;

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

                    var imageFileSpec = selectedFileSpecs[0];

                    fmgr.hide();

                    // history image src
                    var innerDiv = document.createElement('div');
                    var historyImgElem = document.createElement('img');
                    innerDiv.appendChild(historyImgElem);
                    // load image before open window and set JCrop
                    historyImgElem.onload = function () {
                        // load need libraries for cropping
                        require(['jquery.Jcrop'], function () {
                            var coords = [0, 0, 0, 0];

                            function jcropSaveCoords(c) {
                                coords = [c.x, c.y, c.x2, c.y2];
                            }

                            // The variable jcrop_api will hold a reference to the Jcrop API once Jcrop is instantiated
                            $(historyImgElem).Jcrop({
                                onChange: jcropSaveCoords,
                                onSelect: jcropSaveCoords,
                                bgOpacity: 0.6
                            });

                            // submitted by OK button
                            bootstrapModal.openModalWideWindow(innerDiv, function () {
                                // TODO: check not null comments = if user can't choose whole images
                                mdlHistoryOfWell.postImageOfHistoryOfWell(imageFileSpec.id, coords, function () {
                                    bootstrapModal.closeModalWideWindow();
                                });
                            });
                            // end of require
                        });
                    };

                    // start load image
                    historyImgElem.src = imageFileSpec.fileUrl;
                }
                // Add to observable
                fmgr.okCallback(mgrCallback);

                // Notification
                fmgr.okDescription('Please select a history image to crop');

                // Open file manager
                fmgr.show();
            };
        };

        return exports;
    });