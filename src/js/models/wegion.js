﻿/** @module */
define(['jquery',
    'knockout',
    'services/datacontext',
    'helpers/modal-helper',
    'models/wield',
    'models/bases/stage-base',
    'models/section-of-stage',
    'models/prop-spec',
    'services/wegion',
    'services/wield',
    'constants/stage-constants'], function ($, ko, datacontext, bootstrapModal,
        WellField, StageBase, SectionOfWegion, PropSpec, wegionService, wieldService, stageConstants) {
        'use strict';

        // 2. WellField (convert data objects into array)
        function importWieldDtoList(data, parent) {
            return data.map(function (item) { return new WellField(item, parent); });
        }

        function importListOfSectionOfWegionDto(data, parent) {
            return data.map(function (item) { return new SectionOfWegion(item, parent); });
        }

        /** Main properties for company: headers can be translated here if needed */
        var wegionPropSpecList = [
            new PropSpec('name', 'Name', 'Region name', 'SingleLine', { maxLength: 255 }),
            new PropSpec('description', 'Description', 'Description', 'MultiLine', {})
        ];

        /**
        * Well region
        * @constructor
        * @param {object} data - Region data
        * @param {module:models/company} company - Region company (parent)
        */
        var exports = function (data, company) {
            data = data || {};

            var ths = this;

            this.getCompany = function () {
                return company;
            };

            /** Get root view model */
            this.getRootMdl = function () {
                return this.getCompany().getRootMdl();
            };

            // Persisted properties
            this.id = data.Id;
            this.companyId = data.CompanyId;
            this.wields = ko.observableArray();
            /** Props specifications */
            this.propSpecList = wegionPropSpecList;

            /**
            * Stage key: equals file name
            * @type {string}
            */
            this.stageKey = stageConstants.wegion.id;

            /** Base for all stages */
            StageBase.call(this, data);

            /**
            * Get well field by id
            * @param {number} idOfWield - Well field id
            */
            this.getWieldById = function (idOfWield) {
                var tmpWields = ko.unwrap(ths.wields);
                return tmpWields.filter(function (elem) {
                    return elem.id === idOfWield;
                })[0];
            };

            this.removeChild = function (wellFieldForDelete) {
                if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(wellFieldForDelete.name) + '"?')) {
                    wieldService.remove(wellFieldForDelete.Id).done(function () {
                        ths.wields.remove(wellFieldForDelete);
                        // Set parent as selected
                        ths.getCompany().selectWegion(ths);
                    });
                }
            };

            /** Save well region */
            this.save = function () {
                wegionService.put(ths.id, ths.toDto());
            };

            /// <summary>
            /// Convert model to plain json object without unnecessary properties. Can be used to send requests (with clean object) to the server
            /// </summary>
            /// <remarks>
            /// http://knockoutjs.com/documentation/json-data.html
            /// "ko.toJS — this clones your view model’s object graph, substituting for each observable the current value of that observable, 
            /// so you get a plain copy that contains only your data and no Knockout-related artifacts"
            /// </remarks>
            this.toDto = function () {
                var dtoObj = {
                    'Id': ths.id,
                    'CompanyId': ths.companyId
                };

                ths.propSpecList.forEach(function (prop) {
                    dtoObj[prop.serverId] = ko.unwrap(ths[prop.clientId]);
                });

                return dtoObj;
            };

            /** load well fields */
            this.wields(importWieldDtoList(data.WellFieldsDto, ths));

            /** Load sections */
            this.listOfSection(importListOfSectionOfWegionDto(data.ListOfSectionOfWegionDto, ths));
        };

        exports.prototype.addWellField = function () {
            var parentItem = this;

            var inputName = document.createElement('input');
            inputName.type = 'text';
            $(inputName).prop({ 'required': true }).addClass('form-control');

            var innerDiv = document.createElement('div');

            $(innerDiv).addClass('form-horizontal').append(
                bootstrapModal.gnrtDom('Name', inputName)
            );

            function submitFunction() {
                wieldService.post({
                    'Name': $(inputName).val(),
                    'Description': '',
                    'WellRegionId': parentItem.id
                }).done(function (result) {
                    parentItem.wields.push(new WellField(result, parentItem));
                });

                bootstrapModal.closeModalWindow();
            }

            bootstrapModal.openModalWindow('Well field', innerDiv, submitFunction);
        };

        return exports;
    });