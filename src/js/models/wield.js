/** @module */
define(['jquery',
    'knockout',
    'services/datacontext',
    'helpers/file-helper',
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
        fileHelper, StageBase, MapOfWield, mapOfWieldService, SectionOfWield, WellGroup,
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

            this.postMapOfWield = function (tmpIdOfFileSpec, tmpNameOfFileSpec, scsCallback) {
                // Create map on the server with this file
                mapOfWieldService.post(ths.id, {
                    WellFieldId: ths.id,
                    ScaleCoefficient: 1,
                    Description: '',
                    // by default - map name = file name
                    Name: tmpNameOfFileSpec,
                    IdOfFileSpec: tmpIdOfFileSpec
                }).done(function (r) {
                    ths.WellFieldMaps.push(new MapOfWield(r, ths));

                    scsCallback();
                });
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

            /** Post well group */
            this.postWroup = function (tmpName) {
                wroupService.post({
                    'Name': tmpName,
                    'Description': '',
                    'WellFieldId': ths.Id
                }).done(function (result) {
                    ths.wroups.push(new WellGroup(result, ths));
                });
            };

            this.removeChild = function (wellGroupForDelete) {
                wroupService.remove(wellGroupForDelete.id).done(function () {
                    ths.wroups.remove(wellGroupForDelete);
                });
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