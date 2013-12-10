/** @module */
define(['jquery',
    'knockout',
    'services/datacontext',
    'helpers/modal-helper',
    'models/well',
    'models/wfm-parameter-of-wroup'], function ($, ko, datacontext, bootstrapModal, Well, WellGroupWfmParameter) {
        'use strict';

        // 18. WellGroupWfmParameter
        function importWellGroupWfmParameterDtoList(data, wellGroupItem) { return $.map(data || [], function (item) { return new WellGroupWfmParameter(item, wellGroupItem); }); }

        // 4. Wells (convert data objects into array)
        function importWellsDto(data, parent) { return $.map(data || [], function (item) { return new Well(item, parent); }); }

        /**
        * Well group
        * @constructor
        * @param {object} data - Group data
        * @param {module:models/wield} wellField - Well field (parent)
        */
        var exports = function (data, wellField) {
            data = data || {};

            /** Alternative of this context: for closures etc. */
            var self = this;

            /**
            * Get well field (parent)
            * @returns {module:models/wield}
            */
            this.getWellField = function () {
                return wellField;
            };

            /**
            * Group id
            * @type {number}
            */
            this.Id = data.Id;

            /**
            * Group name
            * @type {string}
            */
            this.Name = ko.observable(data.Name);

            /**
            * Field (parent) id
            * @type {number}
            */
            this.WellFieldId = data.WellFieldId;

            /**
            * List of well for this group
            * @type {Array.<module:models/well>}
            */
            this.Wells = ko.observableArray();

            /**
            * Selected well
            * @type {module:models/well}
            */
            this.selectedWell = ko.observable();

            /**
            * Select well (child)
            * @param {module:models/well} wellToSelect - Well to select
            */
            this.selectWell = function (wellToSelect) {
                ////window.location.hash = window.location.hash.split('?')[0] + '?' + $.param({
                ////    region: self.getWellGroup().getWellField().getWellRegion().Id,
                ////    field: self.getWellGroup().getWellField().Id,
                ////    group: self.getWellGroup().Id,
                ////    well: self.Id
                ////});

                // By default - no template - show widget page
                // Previous - by default - summary self.sectionList[0].id;
                var previousSelectedSection;

                var prevSlcWellRegion = ko.unwrap(self.getWellField().getWellRegion().getCompany().selectedWegion);

                // get previous selected section (if exists)
                if (prevSlcWellRegion) {
                    var prevSlcWellField = ko.unwrap(prevSlcWellRegion.selectedWield);
                    if (prevSlcWellField) {
                        var prevSlcWellGroup = ko.unwrap(prevSlcWellField.selectedWroup);
                        if (prevSlcWellGroup) {
                            // previous selected well
                            var prevSlcWell = ko.unwrap(prevSlcWellGroup.selectedWell);
                            if (prevSlcWell) {
                                previousSelectedSection = ko.unwrap(prevSlcWell.selectedSection);

                                // If selected perfomance section
                                var tmpSelectedAttrGroupId = ko.unwrap(prevSlcWell.mainPerfomanceView.selectedAttrGroupId);
                                if (tmpSelectedAttrGroupId) {
                                    wellToSelect.mainPerfomanceView.selectedAttrGroupId(tmpSelectedAttrGroupId);
                                }
                            }
                        }
                    }
                }

                // set new selected data (plus region in the end)
                var slcWellGroup = self;
                var slcWellField = self.getWellField();
                var slcWellRegion = slcWellField.getWellRegion();
                var slcCompany = slcWellRegion.getCompany();

                // 1. Section
                if (previousSelectedSection) {
                    wellToSelect.selectSectionByPatternId(previousSelectedSection.SectionPatternId);
                }
                else {
                    wellToSelect.unselectSection();
                }

                // 2. Well
                // set selected items in DESC order (can be redraw each time if ASC order)
                // set selected well
                slcWellGroup.selectedWell(wellToSelect);

                // 3. Group: set selected well group
                slcWellField.selectedWroup(slcWellGroup);

                // 4: Field: set selected well field
                slcWellRegion.selectedWield(slcWellField);

                // 5. Region
                slcCompany.selectedWegion(slcWellRegion);
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

            self.getWellGroupWfmParameterList = function () {
                if (ko.unwrap(self.isLoadWellGroupWfmParameterList) === false) {
                    datacontext.getWellGroupWfmParameterList({ wellgroup_id: self.Id }).done(function (response) {
                        self.wellGroupWfmParameterList(importWellGroupWfmParameterDtoList(response));
                        self.isLoadWellGroupWfmParameterList(true);
                    });
                }
            };

            var appViewModel = self.getWellField().getWellRegion().getParentViewModel();

            // wfm parameter from main source which is not in this group
            self.unselectedWfmParameterList = ko.computed({
                read: function () {
                    // two arrays
                    return $.grep(ko.unwrap(appViewModel.wfmParameterList), function (prmElem) {
                        var isParamExist = false;
                        $.each(ko.unwrap(self.wellGroupWfmParameterList), function (wlgIndex, wlgElem) {
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
            self.selectedWfmParameterId = ko.observable();

            self.addWellGroupWfmParameter = function () {
                var tmpWfmParamId = ko.unwrap(self.selectedWfmParameterId);
                if (tmpWfmParamId) {
                    datacontext.postWellGroupWfmParameter({
                        Color: '',
                        SerialNumber: 1,
                        WellGroupId: self.Id,
                        WfmParameterId: tmpWfmParamId
                    }).done(function (response) {
                        self.wellGroupWfmParameterList.push(new WellGroupWfmParameter(response, self));
                    });
                }
            };

            ////self.addWellGroupWfmParameter = function () {
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
            ////                WellGroupId: self.Id,
            ////                WfmParameterId: $(inputId).val()
            ////            });

            ////            datacontext.postWellGroupWfmParameter(wellGroupWfmParameterNew).done(function (response) {
            ////                var createdWellGroupWfmParameter = datacontext.createWellGroupWfmParameter(response);
            ////                createdWellGroupWfmParameter.wfmParameter = createdWfmParameter;
            ////                self.wellGroupWfmParameterList.push(createdWellGroupWfmParameter);
            ////            });
            ////            // or error - id is denied
            ////            // if one company get for itself purposes all ids, then will be errors frequently
            ////        });

            ////        bootstrapModal.closeModalWindow();
            ////    }

            ////    bootstrapModal.openModalWindow("Add parameter", innerDiv, submitFunction);
            ////};

            self.addWell = function () {
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
                        WellGroupId: self.Id
                    }).done(function (result) {
                        self.Wells.push(new Well(result, self));
                    });

                    bootstrapModal.closeModalWindow();
                }

                bootstrapModal.openModalWindow('Well', innerDiv, submitFunction);
            };

            self.deleteWell = function (wellForDelete) {
                if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(wellForDelete.Name) + '"?')) {
                    datacontext.deleteWell(wellForDelete).done(function () {
                        self.Wells.remove(wellForDelete);
                        // Select this wroup
                        self.getWellField().selectWroup(self);
                    });
                }
            };

            self.editWellGroup = function () {
                var inputName = document.createElement('input');
                inputName.type = 'text';
                $(inputName).val(self.Name()).prop({ 'required': true }).addClass('form-control');

                var innerDiv = document.createElement('div');
                $(innerDiv).addClass('form-horizontal').append(
                    bootstrapModal.gnrtDom('Name', inputName)
                );

                function submitFunction() {
                    self.Name($(inputName).val());
                    datacontext.saveChangedWellGroup(self).done(function (result) { self.Name(result.Name); });
                    bootstrapModal.closeModalWindow();
                }

                bootstrapModal.openModalWindow("Well group", innerDiv, submitFunction);
            };

            self.isOpenItem = ko.observable(false);

            self.toggleItem = function () {
                self.isOpenItem(!self.isOpenItem());
            };

            /** Whether item and parent are selected */
            self.isSelectedItem = ko.computed({
                read: function () {
                    var tmpField = self.getWellField();
                    if (ko.unwrap(tmpField.isSelectedItem)) {
                        if (self === ko.unwrap(tmpField.selectedWroup)) {
                            return true;
                        }
                    }
                },
                deferEvaluation: true
            });

            /** Is item selected and showed on the page */
            self.isShowedItem = ko.computed({
                read: function () {
                    if (ko.unwrap(self.isSelectedItem)) {
                        if (!ko.unwrap(self.selectedWell)) {
                            return true;
                        }
                    }
                },
                deferEvaluation: true
            });

            self.toPlainJson = function () {
                ////var copy = ko.toJS(self);
                var tmpPropList = ['Id', 'Name', 'WellFieldId'];
                var objReady = {};
                $.each(tmpPropList, function (propIndex, propValue) {
                    // null can be sended to ovveride current value to null
                    if (typeof ko.unwrap(self[propValue]) !== 'undefined') {
                        objReady[propValue] = ko.unwrap(self[propValue]);
                    }
                });

                return objReady;
            };

            // load wells
            self.Wells(importWellsDto(data.WellsDto, self));
        };

        return exports;
    });