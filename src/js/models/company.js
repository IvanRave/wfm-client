﻿/** @module */
define(['jquery', 'knockout', 'models/wegion', 'models/job-type', 'services/datacontext',
    'helpers/modal-helper', 'helpers/history-helper', 'models/stage-base', 'models/sections/section-of-company',
    'models/prop-spec', 'services/company',
    'helpers/knockout-lazy'], function ($, ko, Wegion, JobType, appDatacontext, modalHelper, historyHelper, StageBase, SectionOfCompany, PropSpec, companyService) {
        'use strict';

        /** Import well regions for company */
        function importWegions(data, companyParent) {
            return $.map(data, function (item) { return new Wegion(item, companyParent); });
        }

        /** Import job types for this company (joined with global types) */
        function importJobTypeList(data) {
            return $.map(data || [], function (item) { return new JobType(item); });
        }

        /** Import company sections */
        function importListOfSectionOfCompanyDto(data, parent) {
            return data.map(function (item) {
                return new SectionOfCompany(item, parent);
            });
        }

        /** Main properties for company: headers can be translated here if needed */
        var companyPropSpecList = [
            new PropSpec('name', 'Name', 'Company name', 'SingleLine', 255),
            new PropSpec('description', 'Description', 'Company description', 'MultiLine')
        ];

        /**
        * Company model
        * @constructor
        * @param {object} data - Company data
        */
        var exports = function (data, rootViewModel) {
            data = data || {};

            var ths = this;

            this.getRootViewModel = function () {
                return rootViewModel;
            };

            /**
            * Company guid
            * @type {string}
            */
            this.id = data.Id;

            /** Props specifications */
            this.propSpecList = companyPropSpecList;

            /** Props values: all observables */
            this.propSpecList.forEach(function (prop) {
                ths[prop.clientId] = ko.observable(data[prop.serverId]);
            });

            /**
            * Logo url
            * @type {string}
            */
            this.logoUrl = ko.observable(data.LogoUrl || 'img/question.jpg');

            /**
            * List of well regions
            * @type {module:models/wegion}
            */
            this.wegions = ko.observableArray();

            /** Base for all stages */
            StageBase.call(this);

            /** 
            * Select section
            * @param {object} sectionToSelect
            */
            this.selectSection = function (sectionToSelect) {
                ths.selectedSection(sectionToSelect);
            };

            /**
            * Whether well regions are loaded
            * @type {boolean}
            */
            this.isLoadedWegions = ko.observable(false);

            this.jobTypeList = ko.lazyObservableArray(function () {
                appDatacontext.getJobTypeList(ths.id).done(function (r) {
                    ths.jobTypeList(importJobTypeList(r));
                });
            }, this);

            /** Modal window for adding job type */
            this.goToPostingJobType = function () {
                var jobTypeNewName = window.prompt('{{capitalizeFirst lang.toAddJobTypeToList}}');
                if (jobTypeNewName) {
                    appDatacontext.postCompanyJobType(ths.id, {
                        name: jobTypeNewName,
                        description: '',
                        companyId: ths.id
                    }).done(function (jobTypeCreated) {
                        ths.jobTypeList.push(new JobType(jobTypeCreated));
                    });
                }
            };

            /**
            * Selected region
            * @type {module:models/wegion}
            */
            this.selectedWegion = ko.observable();

            /**
            * Select well region
            * @param {module:models/wegion} wegionToSelect - Well region to select
            * @param {object} [initialData] - Initial data
            */
            this.selectWegion = function (wegionToSelect, initialData) {
                initialData = initialData || {};

                wegionToSelect.isOpenItem(true);

                // Unselect child
                wegionToSelect.selectedWield(null);

                // Select self
                ths.selectedWegion(wegionToSelect);

                // Select parents (not need)

                // Select summary section
                wegionToSelect.selectedSection(wegionToSelect.getSectionByPatternId('wegion-summary'));

                if (!initialData.isHistory) {
                    historyHelper.pushState('/companies/' + ths.id + '/well-regions/' + wegionToSelect.Id);
                }

                ////if (initialData.wieldId) {
                ////    wegionToSelect.selectWieldById(initialData.wieldId);
                ////}
            };

            /**
            * Select region by id: wrap for select wegion function
            * @param {number} wegionId - Id of well region
            * @param {object} initialData - Initial data
            */
            this.selectWegionById = function (wegionId, initialData) {
                if ($.isNumeric(wegionId)) {
                    var tmpWegions = ko.unwrap(ths.wegions);

                    tmpWegions.forEach(function (tmpWegion) {
                        if (tmpWegion.Id === wegionId) {
                            ths.selectWegion(tmpWegion, initialData);
                        }
                    });
                }
            };

            /** Delete well region */
            this.deleteWegion = function (wellRegionForDelete) {
                if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(wellRegionForDelete.Name) + '"?')) {
                    appDatacontext.deleteWellRegion(wellRegionForDelete).done(function () {
                        ths.wegions.remove(wellRegionForDelete);

                        ths.selectedWegion(null);

                        ////window.location.hash = window.location.hash.split('?')[0];
                    });
                }
            };

            /** Create and post new well region */
            this.postWegion = function () {
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
                        CompanyId: ths.id
                    }).done(function (result) {
                        ths.wegions.push(new Wegion(result, ths));
                    });

                    modalHelper.closeModalWindow();
                });
            };

            this.modalFileMgr = {
                isOpen: ko.observable(false),
                okDescription: ko.observable(''),
                okError: ko.observable(''),
                // Callback for Ok button
                okCallback: ko.observable(),
                // When click from view using data-bind click event, then first argument - it is context
                show: function () {
                    // TODO: add ok callback description: 'choose map file...'
                    ths.modalFileMgr.isOpen(true);
                },
                hide: function () {
                    ths.modalFileMgr.isOpen(false);
                },
                hiddenCallback: function () {
                    ths.modalFileMgr.isOpen(false);
                    ths.modalFileMgr.okDescription('');
                    ths.modalFileMgr.okError('');
                    ths.modalFileMgr.okCallback(null);
                }
            };

            /** Save properties */
            this.save = function () {
                companyService.put({ id: ths.id }, ths.toDto());
            };

            /** 
            * Load wegions of this company
            * @param {object} [initialData] - Initial data
            */
            this.loadWegions = function (initialData) {
                initialData = initialData || {};

                if (!ko.unwrap(ths.isLoadedWegions)) {
                    appDatacontext.getWellRegionList({
                        company_id: ths.id,
                        is_inclusive: true
                    }).done(function (response) {
                        ths.wegions(importWegions(response, ths));
                        ths.isLoadedWegions(true);

                        if ($.isNumeric(initialData.wegionId)) {
                            ths.selectWegionById(initialData.wegionId, initialData);
                        }
                    });
                }
                else {
                    if ($.isNumeric(initialData.wegionId)) {
                        ths.selectWegionById(initialData.wegionId, initialData);
                    }
                }
            };

            /** Convert to data transfer object to sent to the server*/
            this.toDto = function () {
                var dtoObj = {
                    Id: ths.id,
                    LogoUrl: ko.unwrap(ths.logoUrl)
                };

                ths.propSpecList.forEach(function (prop) {
                    dtoObj[prop.serverId] = ko.unwrap(ths[prop.clientId]);
                });

                return dtoObj;
            };

            /** Load sections */
            this.listOfSection(importListOfSectionOfCompanyDto(data.ListOfSectionOfCompanyDto, ths));
        };

        return exports;
    });