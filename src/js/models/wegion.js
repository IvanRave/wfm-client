/** @module */
define(['jquery',
    'knockout',
    'services/datacontext',
    'helpers/modal-helper',
    'models/wield', 'models/stage-base',
    'models/sections/section-of-wegion',
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
            this.getRootViewModel = function () {
                return this.getCompany().getRootViewModel();
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

            /** Is selected item */
            this.isSelectedItem = ko.computed({
                read: function () {
                    return (ths === ko.unwrap(ths.getCompany().selectedWegion));
                },
                deferEvaluation: true
            });

            /** 
            * Is item selected and showed on the page 
            * @type {boolean}
            */
            this.isShowedItem = ko.computed({
                read: function () {
                    if (ko.unwrap(ths.isSelectedItem)) {
                        if (!ko.unwrap(ths.selectedWield)) {
                            return true;
                        }
                    }
                },
                deferEvaluation: true
            });

            this.selectedWield = ko.observable();

            /**
            * Get well field by id
            * @type {number} idOfWield - Well field id
            */
            this.getWieldById = function (idOfWield) {
                var tmpWields = ko.unwrap(ths.wields);
                return tmpWields.filter(function (elem) {
                    return elem.id === idOfWield;
                })[0];
            };

            /** Select well field */
            this.selectWield = function (wieldToSelect) {
                ths.selectChildStage(wieldToSelect);

                var tmpInitialUrlData = ko.unwrap(ths.getRootViewModel().initialUrlData);

                if (tmpInitialUrlData.wroupId) {
                    var needWroup = wieldToSelect.getWroupById(tmpInitialUrlData.wroupId);
                    if (needWroup) {
                        wieldToSelect.selectWroup(needWroup);
                    }
                    else
                    {
                        alert('Well group from url is not found');
                    }

                    delete tmpInitialUrlData.wroupId;
                    ths.getRootViewModel().initialUrlData(tmpInitialUrlData);
                }
                else if (tmpInitialUrlData.wieldSectionId) {
                    // Select section

                    var tmpSection = wieldToSelect.getSectionByPatternId('wield-' + tmpInitialUrlData.wieldSectionId);
                    wieldToSelect.selectSection(tmpSection);

                    // Remove section id from
                    delete tmpInitialUrlData.wieldSectionId;
                    ths.getRootViewModel().initialUrlData(tmpInitialUrlData);
                }
                else {
                    // Show dashboard
                    wieldToSelect.unselectSection();
                    // Unselect child to show parent content
                    wieldToSelect.selectedWroup(null);
                }

                // Select ths
                ths.selectedWield(wieldToSelect);

                // Select parents
                ths.getCompany().selectedWegion(ths);

                // Select section by default (or selected section from prevous selected field)
                ////var needSection = $.grep(ko.unwrap(wieldToSelect.listOfSection), function (arrElem) {
                ////    return (arrElem.sectionPatternId === 'wield-map');
                ////})[0];

                ////if (needSection) {
                ////    wieldToSelect.selectSection(needSection);
                ////}
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