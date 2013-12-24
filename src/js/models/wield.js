/** @module */
define(['jquery',
    'knockout',
    'services/datacontext',
    'helpers/file-helper',
    'helpers/modal-helper',
    'models/stage-base',
    'models/map-of-wield',
    'models/sections/section-of-wield',
    'models/wroup',
    'models/prop-spec',
    'services/wield',
    'services/wroup',
    'models/stage-constants'], function ($, ko, datacontext,
        fileHelper, bootstrapModal, StageBase, WellFieldMap, SectionOfWield, WellGroup,
        PropSpec, wieldService, wroupService, stageConstants) {
        'use strict';

        // 10. WellFieldMaps (convert data objects into array)
        function importWellFieldMapsDto(data, parent) {
            return data.map(function (item) { return new WellFieldMap(item, parent); });
        }

        // 3. WellGroup (convert data objects into array)
        function importWroupDtoList(data, parent) {
            return data.map(function (item) { return new WellGroup(item, parent); });
        }

        function importListOfSectionOfWieldDto(data, parent) {
            return data.map(function (item) { return new SectionOfWield(item, parent); });
        }

        /** Main properties for company: headers can be translated here if needed */
        var wieldPropSpecList = [
            new PropSpec('name', 'Name', 'Field name', 'SingleLine', { maxLength: 255 }),
            new PropSpec('description', 'Description', 'Description', 'MultiLine', {})
        ];

        /**
        * Well field
        * @constructor
        * @param {object} data - Field data
        * @param {module:models/wegion} wellRegion - Region (parent)
        */
        var exports = function (data, wellRegion) {
            data = data || {};

            var ths = this;

            /** Get region (parent) */
            this.getWellRegion = function () {
                return wellRegion;
            };

            this.propSpecList = wieldPropSpecList;

            /**
            * Field id
            * @type {number}
            */
            this.Id = data.Id;

            /**
            * Id of region (parent): foreign key
            * @type {number}
            */
            this.idOfWegion = data.WellRegionId;

            // Add identical properties for all stages (well, field, group, regions, company)
            StageBase.call(this, data, stageConstants.wield.id);

            /**
            * List of groups
            * @type {Array.<module:models/wroup>}
            */
            this.wroups = ko.observableArray();

            /** Selected group */
            this.selectedWroup = ko.observable();

            this.selectWroup = function (wroupToSelect) {
                ////window.location.hash = window.location.hash.split('?')[0] + '?' + $.param({
                ////    region: ths.getWellField().getWellRegion().Id,
                ////    field: ths.getWellField().Id,
                ////    group: ths.Id
                ////});

                wroupToSelect.isOpenItem(true);
                // Unselect all wells
                wroupToSelect.selectedWell(null);
                // Set group as selected
                ths.selectedWroup(wroupToSelect);

                // Set all parents as selected
                ths.getWellRegion().selectedWield(ths);
                ths.getWellRegion().getCompany().selectedWegion(ths.getWellRegion());

                // get last approved scopes of every well (one request)
                // insert in every well
                // get all test data for every with total

                var wellIdList = wroupToSelect.Wells().map(function (el) {
                    return el.Id;
                });

                if (wellIdList.length === 0) { return; }

                wroupToSelect.getWellGroupWfmParameterList();

                datacontext.getTestScope({ wellIdList: wellIdList }).done(function (result) {
                    if (result.length > 0) {
                        //for (var w = 0, wMax = ths.Wells().length; w < wMax; w++) {
                        $.each(wroupToSelect.Wells(), function (wellIndex, wellValue) {
                            //for (var i = 0, iMax = objSet.length; i < iMax; i++) {
                            $.each(result, function (objIndex, objValue) {
                                if (wellValue.Id === objValue.WellId) {
                                    wellValue.lastTestScope(datacontext.createTestScope(objValue, wellValue));
                                    return false;
                                }
                            });
                        });
                    }
                });
            };

            /**
            * List of maps
            * @type {Array.<module:models/map-of-wield>}
            */
            this.WellFieldMaps = ko.observableArray();

            /** Selected map */
            this.selectedWieldMap = ko.observable();

            /** Set this section as selected */
            this.selectSection = function (sectionToSelect) {
                if (sectionToSelect) {
                    switch (sectionToSelect.sectionPatternId) {
                        case 'wield-map':
                            // Get all maps from this field
                            ths.getWellFieldMaps(function () {
                                var arr = ko.unwrap(ths.WellFieldMaps);
                                if (arr.length > 0) {
                                    arr[0].showWellFieldMap();
                                }
                            });

                            //ths.initMapFileUpload();
                            break;
                    }

                    ths.selectedSection(sectionToSelect);
                }
            };

            this.deleteWellFieldMap = function (itemToDelete) {
                if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(itemToDelete.name) + '"?')) {
                    datacontext.deleteWellFieldMap(ths.Id, itemToDelete.Id).done(function () {
                        ths.WellFieldMaps.remove(itemToDelete);
                    });
                }
            };

            this.getWellFieldMaps = function (callbackFunction) {
                if (ths.WellFieldMaps().length === 0) {
                    datacontext.getWellFieldMaps(ths.Id).done(function (result) {
                        ths.WellFieldMaps(importWellFieldMapsDto(result, ths));

                        if ($.isFunction(callbackFunction) === true) {
                            callbackFunction();
                        }
                    });
                }
                else {
                    if ($.isFunction(callbackFunction) === true) {
                        callbackFunction();
                    }
                }
            };

            /**
            * Create map from file
            */
            this.createMapFromFile = function () {
                var needSection = ths.getSectionByPatternId('wield-map');

                // Select file section with maps (load and unselect files)
                ths.selectFileSection(needSection);

                var tmpModalFileMgr = ths.getWellRegion().getCompany().modalFileMgr;

                // Calback for selected file
                // Click "Select file for map" ... (only image files)
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

                    // Create map on the server with this file
                    datacontext.postMapOfWield(ths.Id, {
                        WellFieldId: ths.Id,
                        ScaleCoefficient: 1,
                        Description: '',
                        // by default - map name = file name
                        Name: ko.unwrap(selectedFileSpecs[0].name),
                        IdOfFileSpec: selectedFileSpecs[0].id
                    }).done(function (r) {
                        ths.WellFieldMaps.push(new WellFieldMap(r, ths));

                        // Push to well field map list
                        tmpModalFileMgr.hide();
                    });
                }

                // Add to observable
                tmpModalFileMgr.okCallback(mgrCallback);

                // Notification
                tmpModalFileMgr.okDescription('Please select a file for a map');

                // Open file manager
                tmpModalFileMgr.show();
            };

            /** Whether item and parent are selected */
            this.isSelectedItem = ko.computed({
                read: function () {
                    var tmpRegion = ths.getWellRegion();
                    if (ko.unwrap(tmpRegion.isSelectedItem)) {
                        if (ths === ko.unwrap(tmpRegion.selectedWield)) {
                            return true;
                        }
                    }
                },
                deferEvaluation: true
            });

            /** Is item selected and showed on the page */
            this.isShowedItem = ko.computed({
                read: function () {
                    if (ko.unwrap(ths.isSelectedItem)) {
                        if (!ko.unwrap(ths.selectedWroup)) {
                            return true;
                        }
                    }
                },
                deferEvaluation: true
            });

            this.addWellGroup = function () {
                var inputName = document.createElement('input');
                inputName.type = 'text';
                $(inputName).prop({ 'required': true }).addClass('form-control');

                var innerDiv = document.createElement('div');
                $(innerDiv).addClass('form-horizontal').append(
                    bootstrapModal.gnrtDom('Name', inputName)
                );

                function submitFunction() {
                    wroupService.post({
                        'Name': $(inputName).val(),
                        'Description': '',
                        'WellFieldId': ths.Id
                    }).done(function (result) {
                        ths.wroups.push(new WellGroup(result, ths));
                    });

                    bootstrapModal.closeModalWindow();
                }

                bootstrapModal.openModalWindow("Well group", innerDiv, submitFunction);
            };

            this.removeChild = function (wellGroupForDelete) {
                if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(wellGroupForDelete.Name) + '"?')) {
                    wroupService.remove(wellGroupForDelete.Id).done(function () {
                        ths.wroups.remove(wellGroupForDelete);
                        // Set parent as selected item
                        ths.getWellRegion().selectWield(ths);
                    });
                }
            };

            /** Save non-reference properties, like groups, or region */
            this.save = function () {
                wieldService.put(ths.Id, ths.toDto());
            };

            /** Convert to data transfer object: only simple props */
            this.toDto = function () {
                var dtoObj = {
                    'Id': ths.Id,
                    'WellRegionId': ths.idOfWegion
                };

                ths.propSpecList.forEach(function (prop) {
                    dtoObj[prop.serverId] = ko.unwrap(ths[prop.clientId]);
                });

                return dtoObj;
            };

            /** Load groups */
            this.wroups(importWroupDtoList(data.WellGroupsDto, ths));

            /** Load sections */
            this.listOfSection(importListOfSectionOfWieldDto(data.ListOfSectionOfWieldDto, ths));
        };

        return exports;
    });