/** @module */
define(['jquery', 'knockout', 'models/wegion', 'services/datacontext', 'helpers/modal-helper'], function ($, ko, Wegion, appDatacontext, modalHelper) {
    'use strict';

    /** Import well regions for company */
    function importWegions(data, companyParent) {
        return $.map(data, function (item) { return new Wegion(item, companyParent); });
    }

    /**
    * Company model
    * @constructor
    * @param {object} data - Company data
    */
    var exports = function (data, rootViewModel) {
        data = data || {};

        this.getRootViewModel = function () {
            return rootViewModel;
        };

        /**
        * Company guid
        * @type {string}
        */
        this.id = data.Id;

        this.name = data.Name;

        this.description = data.Description;

        this.logoUrl = data.LogoUrl;

        var me = this;
        /**
        * List of well regions
        * @type {module:models/wegion}
        */
        me.wegions = ko.observableArray();

        /**
        * Whether well regions are loaded
        * @type {boolean}
        */
        me.isLoadedWegions = ko.observable(false);

        /**
        * Selected region
        * @type {module:models/wegion}
        */
        me.selectedWegion = ko.observable();

        /** Delete well region */
        me.deleteWegion = function (wellRegionForDelete) {
            if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(wellRegionForDelete.Name) + '"?')) {
                appDatacontext.deleteWellRegion(wellRegionForDelete).done(function () {
                    me.wegions.remove(wellRegionForDelete);

                    me.selectedWegion(null);

                    window.location.hash = window.location.hash.split('?')[0];
                });
            }
        };

        /** Create and post new well region */
        me.postWegion = function () {
            var inputName = document.createElement('input');
            inputName.type = 'text';
            $(inputName).prop({ 'required': true }).addClass('form-control');

            var innerDiv = document.createElement('div');
            $(innerDiv).addClass('form-horizontal').append(
                modalHelper.gnrtDom('Name', inputName)
            );

            modalHelper.openModalWindow('Well region', innerDiv, function () {
                appDatacontext.saveNewWellRegion({
                    Name: $(inputName).val(),
                    CompanyId: me.id
                }).done(function (result) {
                    me.wegions.push(new Wegion(result, me));
                });

                modalHelper.closeModalWindow();
            });
        };

        /** Load wegions of this company */
        me.loadWegions = function () {
            appDatacontext.getWellRegionList({
                company_id: me.id,
                is_inclusive: true
            }).done(function (response) {
                me.wegions(importWegions(response, me));
                me.isLoadedWegions(true);
            });
        };

        // TODO: move this event when click on company (select company)
        me.loadWegions();
    };

    return exports;
});