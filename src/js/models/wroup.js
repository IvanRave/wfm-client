﻿/** @module */
define(['jquery',
    'knockout',
    'services/datacontext',
    'helpers/modal-helper',
    'models/well',
    'models/wfm-parameter-of-wroup',
    'models/section-of-stage',
    'models/bases/stage-base',
    'models/prop-spec',
    'services/wroup',
    'constants/stage-constants'], function ($, ko, datacontext, bootstrapModal, Well, WellGroupWfmParameter,
        SectionOfWroup, StageBase, PropSpec, wroupService, stageConstants) {
        'use strict';

        // 18. WellGroupWfmParameter
        function importWellGroupWfmParameterDtoList(data, wellGroupItem) {
            return data.map(function (item) { return new WellGroupWfmParameter(item, wellGroupItem); });
        }

        // 4. Wells (convert data objects into array)
        function importWells(data, parent) {
            return data.map(function (item) { return new Well(item, parent); });
        }

        /** Import sections */
        function importListOfSectionOfWroupDto(data, parent) {
            return data.map(function (item) { return new SectionOfWroup(item, parent); });
        }

        /** Main properties for groups */
        var wroupPropSpecList = [
            new PropSpec('Name', 'Name', 'Group name', 'SingleLine', { maxLength: 255 }),
            new PropSpec('Description', 'Description', 'Description', 'MultiLine', {})
        ];

        /**
        * Well group
        * @constructor
        * @param {object} data - Group data
        * @param {module:models/wield} wellField - Well field (parent)
        */
        var exports = function (data, wellField) {
            data = data || {};

            /** Alternative of this context: for closures etc. */
            var ths = this;

            /**
            * Get well field (parent)
            * @returns {module:models/wield}
            */
            this.getWellField = function () {
                return wellField;
            };

            /** Get root view model */
            this.getRootMdl = function () {
                return this.getWellField().getRootMdl();
            };

            /**
            * Group id
            * @type {number}
            */
            this.Id = data.Id;

            /** Alternatie for caps Id */
            this.id = data.Id;

            /**
            * Field (parent) id
            * @type {number}
            */
            this.WellFieldId = data.WellFieldId;

            /** Property specifications */
            this.propSpecList = wroupPropSpecList;

            /**
            * Stage key: equals file name
            * @type {string}
            */
            this.stageKey = stageConstants.wroup.id;

            /** Base for all stages */
            StageBase.call(this, data);

            /**
            * List of well for this group
            * @type {Array.<module:models/well>}
            */
            this.wells = ko.observableArray();

            /**
            * Get well by id
            * @param {number} idOfWell - Id of well
            */
            this.getWellById = function (idOfWell) {
                return ko.unwrap(ths.wells).filter(function (elem) {
                    return elem.id === idOfWell;
                })[0];
            };

            /**
            * List of wfm parameters for this group
            * @type {Array.<module:models/wfm-parameter-of-wroup>}
            */
            this.wellGroupWfmParameterList = ko.observableArray();

            /**
            * Whether parameters are loaded
            * @type {boolean}
            */
            this.isLoadWellGroupWfmParameterList = ko.observable(false);

            this.getWellGroupWfmParameterList = function () {
                if (ko.unwrap(ths.isLoadWellGroupWfmParameterList)) {
                    return;
                }

                datacontext.getWellGroupWfmParameterList({ wellgroup_id: ths.Id }).done(function (response) {
                    ths.wellGroupWfmParameterList(importWellGroupWfmParameterDtoList(response));
                    ths.isLoadWellGroupWfmParameterList(true);
                });
            };

            // wfm parameter from main source which is not in this group
            this.unselectedWfmParameterList = ko.computed({
                read: function () {
                    // two dimensioanl array
                    var tmpList = ko.unwrap(ths.getRootMdl().wfmParameterList);
                    return $.grep(tmpList, function (prmElem) {
                        var isParamExist = false;
                        $.each(ko.unwrap(ths.wellGroupWfmParameterList), function (wlgIndex, wlgElem) {
                            if (wlgElem.wfmParameterId === prmElem.id) {
                                isParamExist = true;
                                // break from arr
                                return false;
                            }
                        });

                        // return params which are not selected in this well group
                        return !isParamExist;
                    });
                },
                deferEvaluation: true
            });

            // WFM parameter which user select from unselected wfm parameter list (from root)
            this.selectedWfmParameterId = ko.observable();

            this.addWellGroupWfmParameter = function () {
                var tmpWfmParamId = ko.unwrap(ths.selectedWfmParameterId);
                if (tmpWfmParamId) {
                    datacontext.postWellGroupWfmParameter({
                        Color: '',
                        SerialNumber: 1,
                        WellGroupId: ths.Id,
                        WfmParameterId: tmpWfmParamId
                    }).done(function (response) {
                        ths.wellGroupWfmParameterList.push(new WellGroupWfmParameter(response, ths));
                    });
                }
            };

            ////this.addWellGroupWfmParameter = function () {
            ////    var inputId = document.createElement("input");
            ////    inputId.type = "text";
            ////    $(inputId).prop({ pattern: "[a-zA-Z]+", title: "Only letters: a-z(A-Z)", required: true });

            ////    var inputName = document.createElement("input");
            ////    inputName.type = "text";
            ////    $(inputName).prop({ required: true });

            ////    var inputIsCumulative = document.createElement("input");
            ////    inputIsCumulative.type = "checkbox";

            ////    var innerDiv = document.createElement("div");
            ////    $(innerDiv).addClass("form-horizontal").append(
            ////        bootstrapModal.gnrtDom("Parameter id", inputId),
            ////        bootstrapModal.gnrtDom("Name", inputName),
            ////        bootstrapModal.gnrtDom("Is cumulative", inputIsCumulative)
            ////    );

            ////    function submitFunction() {
            ////        // request to create new wfmParameter
            ////        var wfmParameterNew = datacontext.createWfmParameter({
            ////            Id: $(inputId).val(),
            ////            Name: $(inputName).val(),
            ////            Uom: "",
            ////            DefaultColor: "",
            ////            IsCumulative: $(inputIsCumulative).prop("checked"),
            ////            IsSystem: false
            ////        });

            ////        datacontext.postParameter(wfmParameterNew).done(function (wfmParameterResponse) {
            ////            var createdWfmParameter = datacontext.createWfmParameter(wfmParameterResponse);

            ////            // request to create wellGroupWfmParameter 
            ////            var wellGroupWfmParameterNew = datacontext.createWellGroupWfmParameter({
            ////                Color: "",
            ////                SerialNumber: 1,
            ////                WellGroupId: ths.Id,
            ////                WfmParameterId: $(inputId).val()
            ////            });

            ////            datacontext.postWellGroupWfmParameter(wellGroupWfmParameterNew).done(function (response) {
            ////                var createdWellGroupWfmParameter = datacontext.createWellGroupWfmParameter(response);
            ////                createdWellGroupWfmParameter.wfmParameter = createdWfmParameter;
            ////                ths.wellGroupWfmParameterList.push(createdWellGroupWfmParameter);
            ////            });
            ////            // or error - id is denied
            ////            // if one company get for itths purposes all ids, then will be errors frequently
            ////        });

            ////        bootstrapModal.closeModalWindow();
            ////    }

            ////    bootstrapModal.openModalWindow("Add parameter", innerDiv, submitFunction);
            ////};

            this.addWell = function () {
                var inputName = document.createElement('input');
                inputName.type = 'text';
                $(inputName).prop({ 'required': true }).addClass('form-control');

                var innerDiv = document.createElement('div');
                $(innerDiv).addClass('form-horizontal').append(
                    bootstrapModal.gnrtDom('Name', inputName)
                );

                function submitFunction() {
                    datacontext.postWell({
                        Name: $(inputName).val(),
                        Description: '',
                        WellGroupId: ths.Id
                    }).done(function (result) {
                        ths.wells.push(new Well(result, ths));
                    });

                    bootstrapModal.closeModalWindow();
                }

                bootstrapModal.openModalWindow('Well', innerDiv, submitFunction);
            };

            this.removeChild = function (wellForDelete) {
                if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(wellForDelete.Name) + '"?')) {
                    datacontext.deleteWell(wellForDelete).done(function () {
                        ths.wells.remove(wellForDelete);
                        // Select this wroup
                        ths.getWellField().selectWroup(ths);
                    });
                }
            };

            this.save = function () {
                wroupService.put(ths.Id, ths.toDto());
            };

            this.toDto = function () {
                var dtoObj = {
                    'Id': ths.Id,
                    'WellFieldId': ths.WellFieldId
                };

                ths.propSpecList.forEach(function (prop) {
                    dtoObj[prop.serverId] = ko.unwrap(ths[prop.clientId]);
                });

                return dtoObj;
            };

            // load wells
            this.wells(importWells(data.WellsDto, ths));

            /** Load sections */
            this.listOfSection(importListOfSectionOfWroupDto(data.ListOfSectionOfWroupDto, ths));
        };

        return exports;
    });