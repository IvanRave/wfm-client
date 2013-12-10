/** @module */
define(['jquery',
    'knockout',
    'services/datacontext',
    'helpers/file-helper',
    'helpers/modal-helper',
    'models/well-field-map',
    'models/section-of-wield',
    'models/wroup'], function ($, ko, datacontext,
        fileHelper, bootstrapModal, WellFieldMap, SectionOfWield, WellGroup) {
        'use strict';

        // 10. WellFieldMaps (convert data objects into array)
        function importWellFieldMapsDto(data, parent) {
            return $.map(data || [], function (item) {
                return new WellFieldMap(item, parent);
            });
        }

        // 3. WellGroup (convert data objects into array)
        function importWellGroupsDto(data, parent) {
            return $.map(data || [], function (item) { return new WellGroup(item, parent); });
        }

        function importListOfSectionOfWieldDto(data, parent) {
            return $.map(data || [], function (item) {
                return new SectionOfWield(item, parent);
            });
        }

        /**
        * Well field
        * @constructor
        * @param {object} data - Field data
        * @param {module:models/wegion} wellRegion - Region (parent)
        */
        var exports = function (data, wellRegion) {
            data = data || {};

            var self = this;

            /** Get region (parent) */
            this.getWellRegion = function () {
                return wellRegion;
            };

            /**
            * Field id
            * @type {number}
            */
            this.Id = data.Id;

            /**
            * Field name
            * @type {string}
            */
            this.Name = ko.observable(data.Name);

            /**
            * Id of region (parent): foreign key
            * @type {number}
            */
            this.WellRegionId = data.WellRegionId;

            /** 
            * List of sections
            * @type {Array.<module:models/section-of-wield>}
            */
            this.ListOfSectionOfWieldDto = ko.observableArray();

            /**
            * List of groups
            * @type {Array.<module:models/wroup>}
            */
            this.WellGroups = ko.observableArray();

            /** Selected group */
            this.selectedWroup = ko.observable();

            this.selectWroup = function (wroupToSelect) {
                ////window.location.hash = window.location.hash.split('?')[0] + '?' + $.param({
                ////    region: self.getWellField().getWellRegion().Id,
                ////    field: self.getWellField().Id,
                ////    group: self.Id
                ////});

                wroupToSelect.isOpenItem(true);
                // Unselect all wells
                wroupToSelect.selectedWell(null);
                // Set group as selected
                self.selectedWroup(wroupToSelect);

                // Set all parents as selected
                self.getWellRegion().selectedWield(self);
                self.getWellRegion().getCompany().selectedWegion(self.getWellRegion());
               
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
                        //for (var w = 0, wMax = self.Wells().length; w < wMax; w++) {
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
            * @type {Array.<module:models/well-field-map>}
            */
            this.WellFieldMaps = ko.observableArray();

            /** Selected map */
            this.selectedWieldMap = ko.observable();

            /**
            * Selected section
            * @type {module:models/section-of-wield}
            */
            this.selectedSection = ko.observable();

            /** Set this section as selected */
            self.selectSection = function (sectionToSelect) {
                if (sectionToSelect) {
                    switch (sectionToSelect.SectionPatternId) {
                        case 'wield-map':
                            // Get all maps from this field
                            self.getWellFieldMaps(function () {
                                var arr = ko.unwrap(self.WellFieldMaps);
                                if (arr.length > 0) {
                                    arr[0].showWellFieldMap();
                                }
                            });

                            //self.initMapFileUpload();
                            break;
                    }

                    self.selectedSection(sectionToSelect);
                }
            };

            self.deleteWellFieldMap = function (itemToDelete) {
                if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(itemToDelete.FileSpec.Name) + '"?')) {
                    datacontext.deleteWellFieldMap(self.Id, itemToDelete.Id).done(function () {
                        self.WellFieldMaps.remove(itemToDelete);
                    });
                }
            };

            self.getWellFieldMaps = function (callbackFunction) {
                if (self.WellFieldMaps().length === 0) {
                    datacontext.getWellFieldMaps(self.Id).done(function (result) {
                        self.WellFieldMaps(importWellFieldMapsDto(result, self));

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
            * Options for file loader (files loaded to the map-section)
            */
            self.mapFiloader = {
                callback: function (result) {
                    self.WellFieldMaps.push(new WellFieldMap(result[0], self));
                },
                url: datacontext.getWieldMapsUrl(self.Id),
                fileFormats: ['image/jpeg', 'image/png']
            };

            self.isOpenItem = ko.observable(false);

            self.toggleItem = function () {
                self.isOpenItem(!self.isOpenItem());
            };

            /** Whether item and parent are selected */
            self.isSelectedItem = ko.computed({
                read: function () {
                    var tmpRegion = self.getWellRegion();
                    if (ko.unwrap(tmpRegion.isSelectedItem)) {
                        if (self === ko.unwrap(tmpRegion.selectedWield)) {
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
                        if (!ko.unwrap(self.selectedWroup)) {
                            return true;
                        }
                    }
                },
                deferEvaluation: true
            });

            self.addWellGroup = function () {
                var inputName = document.createElement('input');
                inputName.type = 'text';
                $(inputName).prop({ 'required': true }).addClass('form-control');

                var innerDiv = document.createElement('div');
                $(innerDiv).addClass('form-horizontal').append(
                    bootstrapModal.gnrtDom('Name', inputName)
                );

                function submitFunction() {
                    datacontext.saveNewWellGroup({
                        Name: $(inputName).val(),
                        WellFieldId: self.Id
                    }).done(function (result) {
                        self.WellGroups.push(new WellGroup(result, self));
                    });

                    bootstrapModal.closeModalWindow();
                }

                bootstrapModal.openModalWindow("Well group", innerDiv, submitFunction);
            };

            self.deleteWellGroup = function (wellGroupForDelete) {
                if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(wellGroupForDelete.Name) + '"?')) {
                    datacontext.deleteWellGroup(wellGroupForDelete).done(function () {
                        self.WellGroups.remove(wellGroupForDelete);
                        // Set parent as selected item
                        self.getWellRegion().selectWield(self);
                    });
                }
            };

            self.editWellField = function () {
                var inputName = document.createElement('input');
                inputName.type = 'text';
                $(inputName).val(self.Name()).prop({ 'required': true }).addClass('form-control');

                var innerDiv = document.createElement('div');
                $(innerDiv).addClass('form-horizontal').append(
                    bootstrapModal.gnrtDom('Name', inputName)
                );

                bootstrapModal.openModalWindow("Well field", innerDiv, function () {
                    self.Name($(inputName).val());
                    datacontext.saveChangedWellField(self).done(function (result) { self.Name(result.Name); });
                    bootstrapModal.closeModalWindow();
                });
            };

            self.toPlainJson = function () {
                var tmpPropList = ['Id', 'Name', 'WellRegionId'];
                var objReady = {};
                $.each(tmpPropList, function (propIndex, propValue) {
                    // null can be sended to ovveride current value to null
                    if (typeof ko.unwrap(self[propValue]) !== 'undefined') {
                        objReady[propValue] = ko.unwrap(self[propValue]);
                    }
                });

                return objReady;
            };

            /** Load groups */
            self.WellGroups(importWellGroupsDto(data.WellGroupsDto, self));

            /** Load sections */
            self.ListOfSectionOfWieldDto(importListOfSectionOfWieldDto(data.ListOfSectionOfWieldDto, self));
        };

        return exports;
    });