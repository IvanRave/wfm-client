/** @module */
define(['jquery',
    'knockout',
    'services/datacontext',
    'helpers/file-helper',
    'helpers/modal-helper',
    'models/stage-base',
    'models/map-of-wield',
    'models/view-models/map-of-wield-vwm',
    'models/sections/section-of-wield',
    'models/wroup',
    'models/prop-spec',
    'services/wield',
    'services/wroup',
    'constants/stage-constants'], function ($, ko, datacontext,
        fileHelper, bootstrapModal, StageBase, MapOfWield, MapOfWieldVwm, SectionOfWield, WellGroup,
        PropSpec, wieldService, wroupService, stageConstants) {
        'use strict';

        // 10. WellFieldMaps (convert data objects into array)
        function importWellFieldMapsDto(data, parent) {
            return (data || []).map(function (item) { return new MapOfWield(item, parent); });
        }

        // 3. WellGroup (convert data objects into array)
        function importWroupDtoList(data, parent) {
            return (data || []).map(function (item) { return new WellGroup(item, parent); });
        }

        function importListOfSectionOfWieldDto(data, parent) {
            return (data || []).map(function (item) { return new SectionOfWield(item, parent); });
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

            /** Get root view model */
            this.getRootViewModel = function () {
                return this.getWellRegion().getRootViewModel();
            };

            this.propSpecList = wieldPropSpecList;

            // TODO: change to small id
            /**
            * Field id
            * @type {number}
            */
            this.Id = data.Id;

            /** Alternative for Id */
            this.id = data.Id;

            /**
            * Id of region (parent): foreign key
            * @type {number}
            */
            this.idOfWegion = data.WellRegionId;

            /**
            * Stage key: equals file name
            * @type {string}
            */
            this.stageKey = stageConstants.wield.id;

            // Add identical properties for all stages (well, field, group, regions, company)
            StageBase.call(this, data);

            /**
            * List of groups
            * @type {Array.<module:models/wroup>}
            */
            this.wroups = ko.observableArray();

            /** Selected group */
            this.selectedWroup = ko.observable();

            /** Select well group */
            this.selectWroup = function (wroupToSelect) {
                /** Initial function for all select stage functions */
                ths.selectChildStage(wroupToSelect);

                var tmpInitialUrlData = ko.unwrap(ths.getRootViewModel().initialUrlData);

                if (tmpInitialUrlData.wellId) {
                    var needWell = wroupToSelect.getWellById(tmpInitialUrlData.wellId);
                    if (needWell) {
                        wroupToSelect.selectWell(needWell);
                    }
                    else {
                        alert('Well from url is not found');
                    }

                    // Clean unnecessary ids
                    delete tmpInitialUrlData.wellId;
                    ths.getRootViewModel().initialUrlData(tmpInitialUrlData);
                }
                else if (tmpInitialUrlData.wroupSectionId) {
                    // Select section

                    var tmpSection = wroupToSelect.getSectionByPatternId('wroup-' + tmpInitialUrlData.wroupSectionId);
                    wroupToSelect.selectSection(tmpSection);

                    // Remove section id from
                    delete tmpInitialUrlData.wroupSectionId;
                    ths.getRootViewModel().initialUrlData(tmpInitialUrlData);
                }
                else {
                    // Show dashboard
                    wroupToSelect.unselectSection();
                    // Unselect child to show parent content
                    wroupToSelect.selectedWell(null);
                }

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
            * Get well group by id
            * @param {number} idOfWroup - Id of well group
            */
            this.getWroupById = function (idOfWroup) {
                var tmpWroups = ko.unwrap(ths.wroups);
                return tmpWroups.filter(function (elem) {
                    return elem.id === idOfWroup;
                })[0];
            };

            /**
            * List of maps
            * @type {Array.<module:models/map-of-wield>}
            */
            this.WellFieldMaps = ko.observableArray();

            /** Selected map */
            this.slcMapOfWield = ko.observable();

            /** Select map */
            this.selectMapOfWield = function (mapOfWieldToSelect) {
                ths.slcMapOfWield(mapOfWieldToSelect);
            };

            /**
            * Main view model for this model: can be used one model per few view models
            * @type {<module:models/view-models/map-of-wield-vwm>}
            */
            this.mainVwm = new MapOfWieldVwm(ths.slcMapOfWield, {});

            /** Set this section as selected */
            this.loadSectionContent = function (idOfSectionPattern) {
                switch (idOfSectionPattern) {
                    case 'wield-map':
                        // Get all maps from this field
                        ths.loadMapsOfWield(function () {
                            var arr = ko.unwrap(ths.WellFieldMaps);
                            if (arr.length > 0) {
                                ths.selectMapOfWield(arr[0]);
                            }
                        });

                        //ths.initMapFileUpload();
                        break;
                }
            };

            this.deleteWellFieldMap = function (itemToDelete) {
                if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(itemToDelete.name) + '"?')) {
                    datacontext.deleteWellFieldMap(ths.Id, itemToDelete.Id).done(function () {
                        ths.WellFieldMaps.remove(itemToDelete);
                    });
                }
            };

            /**
            * Whether maps are loaded
            * @type {boolean}
            */
            this.isLoadedMapsOfWield = ko.observable(false);

            /** Load all maps for this field */
            this.loadMapsOfWield = function (callbackFunction) {
                if (ko.unwrap(ths.isLoadedMapsOfWield) === false) {
                    datacontext.getWellFieldMaps(ths.Id).done(function (result) {
                        ths.isLoadedMapsOfWield(true);

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
                        ths.WellFieldMaps.push(new MapOfWield(r, ths));

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

            this.loadDashboard = function () {
                ths.loadMapsOfWield();
                ////ths.sketchOfWell.load();
                ////// TODO: load data only if there is one or more perfomance widgets (only once) for entire well
                ////ths.getWellGroup().getWellGroupWfmParameterList();
                ////ths.perfomancePartial.forecastEvolution.getDict();
                ////ths.perfomancePartial.getHstProductionDataSet();
                ////ths.loadWellHistoryList();
            };

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