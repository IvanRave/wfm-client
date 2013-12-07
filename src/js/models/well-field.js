/** @module */
define(['jquery',
    'knockout',
    'services/datacontext',
    'helpers/file-helper',
    'helpers/modal-helper',
    'models/well-field-map',
    'models/section-of-wield',
    'models/well-group'
], function ($, ko, datacontext, fileHelper, bootstrapModal, WellFieldMap, SectionOfWield) {
    'use strict';

    // 10. WellFieldMaps (convert data objects into array)
    function importWellFieldMapsDto(data, parent) {
        return $.map(data || [], function (item) {
            return new WellFieldMap(item, parent);
        });
    }

    // 3. WellGroup (convert data objects into array)
    function importWellGroupsDto(data, parent) {
        return $.map(data || [], function (item) { return datacontext.createWellGroup(item, parent); });
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
    * @param {module:models/well-region} wellRegion - Region (parent)
    */
    var exports = function (data, wellRegion) {
        data = data || {};

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
        * @type {Array.<module:models/well-group>}
        */
        this.WellGroups = ko.observableArray();

        /** Selected group */
        this.selectedWellGroup = ko.observable();

        /**
        * List of maps
        * @type {Array.<module:models/well-field-map>}
        */
        this.WellFieldMaps = ko.observableArray();

        /** Selected map */
        this.selectedWellFieldMap = ko.observable();

        /**
        * Selected section
        * @type {module:models/section-of-wield}
        */
        this.selectedSection = ko.observable();

        var self = this;

        /** Set this section as selected */
        self.selectSection = function (sectionToSelect) {
            if (sectionToSelect){
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

        self.isSelectedItem = ko.computed(function () {
            return self === self.getWellRegion().selectedWellField();
        });

        self.selectItem = function () {
            self.isOpenItem(true);
            ////self.selectedWellFieldMap(null);

            self.getWellRegion().clearSetSelectedWellRegion();
            self.getWellRegion().selectedWellField(self);

            window.location.hash = window.location.hash.split('?')[0] + '?' + $.param({
                region: self.getWellRegion().Id,
                field: self.Id
            });
        };

        self.addWellGroup = function () {
            var inputName = document.createElement('input');
            inputName.type = 'text';
            $(inputName).prop({ 'required': true }).addClass('form-control');

            var innerDiv = document.createElement('div');
            $(innerDiv).addClass('form-horizontal').append(
                bootstrapModal.gnrtDom('Name', inputName)
            );

            function submitFunction() {
                var wellGroupItem = datacontext.createWellGroup(
                    {
                        Name: $(inputName).val(),
                        WellFieldId: self.Id
                    }, self);

                datacontext.saveNewWellGroup(wellGroupItem).done(function (result) {
                    self.WellGroups.push(datacontext.createWellGroup(result, self));
                });

                bootstrapModal.closeModalWindow();
            }

            bootstrapModal.openModalWindow("Well group", innerDiv, submitFunction);
        };

        self.deleteWellGroup = function (wellGroupForDelete) {
            if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(wellGroupForDelete.Name) + '"?')) {
                datacontext.deleteWellGroup(wellGroupForDelete).done(function () {
                    self.WellGroups.remove(wellGroupForDelete);
                    self.selectItem();
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