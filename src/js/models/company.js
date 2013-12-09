/** @module */
define(['jquery', 'knockout', 'models/wegion', 'models/job-type', 'services/datacontext',
    'helpers/modal-helper', 'helpers/knockout-lazy'], function ($, ko, Wegion, JobType, appDatacontext, modalHelper) {
        'use strict';

        /** Import well regions for company */
        function importWegions(data, companyParent) {
            return $.map(data, function (item) { return new Wegion(item, companyParent); });
        }

        /** Import job types for this company (joined with global types) */
        function importJobTypeList(data) {
            return $.map(data || [], function (item) { return new JobType(item); });
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

            /**
            * Company name
            * @type {string}
            */
            this.name = ko.observable(data.Name);

            /**
            * Company description
            * @type {string}
            */
            this.description = ko.observable(data.Description);

            /**
            * Logo url
            * @type {string}
            */
            this.logoUrl = ko.observable(data.LogoUrl || 'img/question.jpg');

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

            me.jobTypeList = ko.lazyObservableArray(function () {
                appDatacontext.getJobTypeList(me.id).done(function (r) {
                    me.jobTypeList(importJobTypeList(r));
                });
            }, me);

            /** Modal window for adding job type */
            me.goToPostingJobType = function () {
                var jobTypeNewName = window.prompt('{{capitalizeFirst lang.toAddJobTypeToList}}');
                if (jobTypeNewName) {
                    appDatacontext.postCompanyJobType(me.id, {
                        name: jobTypeNewName,
                        description: '',
                        companyId: me.id
                    }).done(function (jobTypeCreated) {
                        me.jobTypeList.push(new JobType(jobTypeCreated));
                    });
                }
            };

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
        };

        return exports;
    });