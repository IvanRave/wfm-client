﻿/** @module */
define(['jquery',
    'knockout',
    'services/datacontext',
    'helpers/file-helper',
    'helpers/modal-helper',
    'models/bases/stage-base',
    'models/map-of-wield',
    'services/map-of-wield',
    'models/section-of-stage',
    'models/wroup',
    'models/prop-spec',
    'services/wield',
    'services/wroup',
    'constants/stage-constants'],
    function ($, ko, datacontext,
        fileHelper, bootstrapModal, StageBase, MapOfWield, mapOfWieldService, SectionOfWield, WellGroup,
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
            this.getRootMdl = function () {
                return this.getWellRegion().getRootMdl();
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

            /** Set this section as selected */
            this.loadSectionContent = function (idOfSectionPattern) {
                switch (idOfSectionPattern) {
                    case 'wield-map':
                        // Get all maps from this field
                        ths.loadMapsOfWield();
                        break;
                }
            };

            /** Remove map from field */
            this.removeMapOfWield = function (itemToDelete) {
                if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(itemToDelete.name) + '"?')) {
                    mapOfWieldService.remove(ths.id, itemToDelete.id).done(function () {
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
            this.loadMapsOfWield = function () {
                if (ko.unwrap(ths.isLoadedMapsOfWield)) { return; }

                mapOfWieldService.get(ths.id).done(function (result) {
                    ths.isLoadedMapsOfWield(true);
                    ths.WellFieldMaps(importWellFieldMapsDto(result, ths));
                });
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
                    mapOfWieldService.post(ths.id, {
                        WellFieldId: ths.id,
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