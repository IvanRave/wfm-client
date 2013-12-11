/** @module */
define(['jquery',
    'knockout',
    'services/datacontext',
    'helpers/modal-helper',
    'models/wield'], function ($, ko, datacontext, bootstrapModal, WellField) {
        'use strict';

        // 2. WellField (convert data objects into array)
        function importWellFieldsDto(data, parent) {
            return $.map(data || [], function (item) {
                return new WellField(item, parent);
            });
        }

        /**
        * Well region
        * @constructor
        * @param {object} data - Region data
        * @param {module:models/company} company - Region company (parent)
        */
        var exports = function (data, company) {
            data = data || {};

            var self = this;

            // Persisted properties
            this.Id = data.Id;
            this.CompanyId = data.CompanyId;
            this.Name = ko.observable(data.Name);
            this.WellFields = ko.observableArray();

            this.getCompany = function () {
                return company;
            };

            this.getParentViewModel = function () {
                return self.getCompany().getRootViewModel();
            };

            this.isOpenItem = ko.observable(false);

            // toggle item - only open menu tree (show inner object without content)
            this.toggleItem = function () {
                self.isOpenItem(!self.isOpenItem());
            };

            /** Is selected item */
            this.isSelectedItem = ko.computed({
                read: function () {
                    return (self === ko.unwrap(self.getCompany().selectedWegion));
                },
                deferEvaluation: true
            });

            /** 
            * Is item selected and showed on the page 
            * @type {boolean}
            */
            this.isShowedItem = ko.computed({
                read: function () {
                    if (ko.unwrap(self.isSelectedItem)) {
                        if (!ko.unwrap(self.selectedWield)) {
                            return true;
                        }
                    }
                },
                deferEvaluation: true
            });

            self.selectedWield = ko.observable();

            self.selectWield = function (wieldToSelect) {
                wieldToSelect.isOpenItem(true);
                
                // Unselect child
                wieldToSelect.selectedWroup(null);

                // Select self
                self.selectedWield(wieldToSelect);
                
                // Select parents
                self.getCompany().selectedWegion(self);

                ////window.location.hash = window.location.hash.split('?')[0] + '?' + $.param({
                ////    region: self.getWellRegion().Id,
                ////    field: self.Id
                ////});

                // Select section by default (or selected section from prevous selected field)
                var mapSection = $.grep(ko.unwrap(wieldToSelect.listOfSectionOfWieldDto), function (arrElem) {
                    return (arrElem.sectionPatternId === 'wield-map');
                })[0];

                if (mapSection) {
                    wieldToSelect.selectSection(mapSection);
                }
            };

            self.deleteWellField = function (wellFieldForDelete) {
                if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(wellFieldForDelete.Name) + '"?')) {
                    datacontext.deleteWellField(wellFieldForDelete.Id).done(function () {
                        self.WellFields.remove(wellFieldForDelete);
                        // Set parent as selected
                        self.getCompany().selectWegion(self);
                    });
                }
            };

            self.editWellRegion = function () {
                var inputName = document.createElement('input');
                inputName.type = 'text';
                $(inputName).val(self.Name()).prop({ 'required': true }).addClass('form-control');

                var innerDiv = document.createElement('div');
                $(innerDiv).addClass('form-horizontal').append(
                    bootstrapModal.gnrtDom('Name', inputName)
                );

                bootstrapModal.openModalWindow("Well region", innerDiv, function () {
                    self.Name($(inputName).val());
                    datacontext.saveChangedWellRegion(self).done(function (result) { self.Name(result.Name); });
                    bootstrapModal.closeModalWindow();
                });
            };

            /// <summary>
            /// Convert model to plain json object without unnecessary properties. Can be used to send requests (with clean object) to the server
            /// </summary>
            /// <remarks>
            /// http://knockoutjs.com/documentation/json-data.html
            /// "ko.toJS — this clones your view model’s object graph, substituting for each observable the current value of that observable, 
            /// so you get a plain copy that contains only your data and no Knockout-related artifacts"
            /// </remarks>
            self.toPlainJson = function () {
                ////var copy = ko.toJS(self);
                var tmpPropList = ['Id', 'CompanyId', 'Name'];

                var objReady = {};
                $.each(tmpPropList, function (propIndex, propValue) {
                    // null can be sended to ovveride current value to null
                    if (typeof ko.unwrap(self[propValue]) !== 'undefined') {
                        objReady[propValue] = ko.unwrap(self[propValue]);
                    }
                });

                return objReady;
            };

            // load well fields
            self.WellFields(importWellFieldsDto(data.WellFieldsDto, self));
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
                datacontext.saveNewWellField({
                    Name: $(inputName).val(),
                    WellRegionId: parentItem.Id
                }).done(function (result) {
                    parentItem.WellFields.push(new WellField(result, parentItem));
                });

                bootstrapModal.closeModalWindow();
            }

            bootstrapModal.openModalWindow('Well field', innerDiv, submitFunction);
        };

        return exports;
    });