define(['jquery', 'knockout',
    'services/datacontext',
    'helpers/modal-helper',
    'helpers/app-helper',
    'models/file-spec-of-history-of-well',
    'services/file-spec-of-history-of-well',
    'models/wfm-image'],
    function ($, ko, datacontext, bootstrapModal, appHelper, FileSpecOfHistoryOfWell, fileSpecOfHistoryOfWellService) {
        'use strict';

        // convert data objects into array
        function importWellHistoryFiles(data) {
            return (data || []).map(function (item) { return new FileSpecOfHistoryOfWell(item); });
        }

        function importWfmImagesDto(data) {
            return (data || []).map(function (item) { return datacontext.createWfmImage(item); });
        }

        function WellHistory(data, well) {
            var ths = this;
            data = data || {};

            this.getWell = function () {
                return well;
            };

            // Properties
            this.id = data.Id;
            this.historyText = ko.observable(data.HistoryText);
            this.startUnixTime = ko.observable(data.StartUnixTime);
            this.endUnixTime = ko.observable(data.EndUnixTime);
            this.jobTypeId = data.JobTypeId ? ko.observable(data.JobTypeId) : ko.observable();
            this.wellId = data.WellId;

            this.WfmImages = ko.observableArray();
            this.WellHistoryFiles = ko.observableArray(importWellHistoryFiles(data.WellHistoryFiles));

            // Load job type id
            // Extract from root.companyJobTypeList by id
            // Computed
            this.jobType = ko.computed({
                read: function () {
                    var tmpJobTypeId = ko.unwrap(ths.jobTypeId);
                    if (tmpJobTypeId) {
                        var companyJobTypeList = ko.unwrap(ths.getWell().getWellGroup().getWellField().getWellRegion().getCompany().jobTypeList);
                        return appHelper.getElementByPropertyValue(companyJobTypeList, 'id', tmpJobTypeId);
                    }
                },
                deferEvaluation: true
            });

            this.isVisibleEndUnixTime = ko.computed({
                read: function () {
                    return ko.unwrap(ths.startUnixTime) !== ko.unwrap(ths.endUnixTime);
                },
                deferEvaluation: true
            });

            this.putWellHistory = function () {
                var wellHistoryData = {
                    id: ko.unwrap(ths.id),
                    startUnixTime: ko.unwrap(ths.startUnixTime),
                    endUnixTime: ko.unwrap(ths.endUnixTime),
                    wellId: ko.unwrap(ths.wellId),
                    historyText: ko.unwrap(ths.historyText),
                    jobTypeId: ko.unwrap(ths.jobTypeId)
                };

                datacontext.putWellHistory(wellHistoryData);
            };

            this.startUnixTime.subscribe(ths.putWellHistory);
            this.endUnixTime.subscribe(ths.putWellHistory);
            this.jobTypeId.subscribe(ths.putWellHistory);

            this.deleteWfmImage = function (itemForDelete) {
                if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + itemForDelete.Name + '"?')) {
                    datacontext.deleteWfmImage(itemForDelete).done(function () {
                        ths.WfmImages.remove(itemForDelete);
                    });
                }
            };

            /** Remove file spec of history of well */
            this.removeFileSpecOfHistoryOfWell = function (fileSpecOfHistoryOfWellToRemove) {
                if (confirm('{{capitalizeFirst lang.confirmToDelete}} this file?')) {
                    fileSpecOfHistoryOfWellService.remove(ths.id, fileSpecOfHistoryOfWellToRemove.idOfFileSpec).done(function () {
                        ths.WellHistoryFiles.remove(fileSpecOfHistoryOfWellToRemove);
                    });
                }
            };

            /**
            * Create file spec of history of well from well section
            */
            this.createFileSpecOfHistoryOfWell = function () {
                var needSection = ths.getWell().getSectionByPatternId('well-history');

                // Select file section with sketches (load and unselect files)
                ths.getWell().selectFileSection(needSection);

                var tmpModalFileMgr = ths.getWell().getWellGroup().getWellField().getWellRegion().getCompany().modalFileMgr;

                // Calback for selected file
                function mgrCallback() {
                    tmpModalFileMgr.okError('');
                    // Select file from file manager
                    var selectedFileSpecs = ko.unwrap(needSection.listOfFileSpec).filter(function (elem) {
                        return ko.unwrap(elem.isSelected);
                    });

                    if (selectedFileSpecs.length !== 1) {
                        tmpModalFileMgr.okError('need to select one file');
                        return;
                    }

                    fileSpecOfHistoryOfWellService.post(ths.id, {
                        idOfFileSpec: selectedFileSpecs[0].id,
                        idOfHistoryOfWell: ths.id,
                        description: ''
                    }).done(function (res) {
                        ths.WellHistoryFiles.push(new FileSpecOfHistoryOfWell(res));
                        tmpModalFileMgr.hide();
                    }).fail(function (jqXHR) {
                        if (jqXHR.status === 422) {
                            var resJson = jqXHR.responseJSON;
                            require(['helpers/lang-helper'], function (langHelper) {
                                var tmpProcessError = (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
                                tmpModalFileMgr.okError(tmpProcessError);
                            });
                        }
                    });
                }

                // Add to observable
                tmpModalFileMgr.okCallback(mgrCallback);

                // Notification
                tmpModalFileMgr.okDescription('Please select a file to attach to this history record');

                // Open file manager
                tmpModalFileMgr.show();
            };

            this.chooseWfmImage = function () {
                ths.getWell().selectedFmgSectionId('history');
                function callbackFunction(checkedWellFileList) {
                    if (checkedWellFileList.length !== 1) {
                        alert('Need to select one image');
                        return;
                    }

                    var checkedFile = checkedWellFileList[0];
                    if ($.inArray(checkedFile.ContentType, datacontext.imageMimeTypes) === -1) {
                        alert('Need to select image file: ' + datacontext.imageMimeTypes.join(', '));
                        return;
                    }

                    bootstrapModal.closeModalFileManager();

                    var urlQueryParams = {
                        well_id: ths.wellId,
                        purpose: 'history',
                        status: 'work',
                        file_name: checkedFile.Name()
                    };

                    // history image src
                    var path = datacontext.getWellFileUrl(urlQueryParams);
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
                                ////var url = path + '&crop=(' + coords[0] + ',' + coords[1] + ',' + coords[2] + ',' + coords[3] + ')';
                                // check not null comments = if user can't choose whole images
                                // create wfmimage
                                var wfmImageReady = datacontext.createWfmImage({
                                    X1: coords[0],
                                    X2: coords[2],
                                    Y1: coords[1],
                                    Y2: coords[3],
                                    // full name (well_id + purpose + status + sdf
                                    // 71/history/work/fid20130211042811196_WellHistory.png
                                    Name: [urlQueryParams.well_id, urlQueryParams.purpose, urlQueryParams.status, urlQueryParams.file_name].join('/')
                                });

                                // send coords to database = save in wfmimage
                                datacontext.saveNewWfmImage({ wellhistory_id: ths.id }, wfmImageReady).done(function (saveResult) {
                                    // add images to dom with src
                                    ths.WfmImages.push(datacontext.createWfmImage(saveResult));
                                    // push to wellhistory wfmimages
                                });

                                bootstrapModal.closeModalFileManager();
                            });
                            // end of require
                        });
                    };

                    // start load image
                    historyImgElem.src = path;
                }

                ths.getWell().showFmg(callbackFunction);
            };

            if (data.WfmImagesDto) {
                this.WfmImages(importWfmImagesDto(data.WfmImagesDto));
            }

            // No needs. Extracted from root.jobTypeList
            ////if (data.JobTypeDto) {
            ////    ths.jobType(new JobType(data.JobTypeDto));
            ////}
        }

        datacontext.createWellHistory = function (item, wellParent) {
            return new WellHistory(item, wellParent);
        };
    });