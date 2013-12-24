/** @module */
define(['jquery', 'knockout', 'models/wegion', 'models/job-type', 'services/datacontext',
    'helpers/modal-helper', 'helpers/history-helper', 'models/stage-base', 'models/sections/section-of-company',
    'models/prop-spec', 'services/company', 'models/file-spec', 'services/wegion', 'models/stage-constants',
    'helpers/knockout-lazy'], function ($, ko, Wegion, JobType, appDatacontext, modalHelper, historyHelper,
        StageBase, SectionOfCompany, PropSpec, companyService, FileSpec, wegionService, stageConstants) {
        'use strict';

        /** Import well regions for company */
        function importWegions(data, companyParent) {
            return data.map(function (item) { return new Wegion(item, companyParent); });
        }

        /** Import job types for this company (joined with global types) */
        function importJobTypeList(data) {
            return data.map(function (item) { return new JobType(item); });
        }

        /** Import company sections */
        function importListOfSectionOfCompanyDto(data, parent) {
            return data.map(function (item) { return new SectionOfCompany(item, parent); });
        }

        /** Main properties for company: headers can be translated here if needed */
        var companyPropSpecList = [
            new PropSpec('name', 'Name', 'Company name', 'SingleLine', { maxLength: 255 }),
            new PropSpec('description', 'Description', 'Company description', 'MultiLine', {}),
            new PropSpec('fileSpecOfLogo', 'FileSpecOfLogo', 'Company logo', 'FileLine', {
                width: 100,
                // Client id of property of nested id of file spec
                nestedClientId: 'idOfFileSpecOfLogo'
            }),
            new PropSpec('idOfFileSpecOfLogo', 'IdOfFileSpecOfLogo', '', '', {})
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

            /** Base for all stages */
            StageBase.call(this, data, stageConstants.company.id);

            /**
            * List of well regions
            * @type {module:models/wegion}
            */
            this.wegions = ko.observableArray();

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

            /**
            * Delete only link to file - without removing physically and from section
            * @param {module/prop-spec} fileSpecProp - Property data
            */
            this.deleteImgFileSpec = function (fileSpecProp) {
                ths[fileSpecProp.addtData.nestedClientId](null);
                ths[fileSpecProp.clientId](null);

                ths.save();

                ////var tmpFileSpecElem = ko.unwrap(ths[fileSpecProp.clientId]);
                ////if (!tmpFileSpecElem) { return; }
                ////// Select file section with logos

                ////var idOfFileSpec = tmpFileSpecElem.id;
                ////console.log(idOfFileSpec);
                ////var needSection = ths.getSectionByPatternId('company-summary');
                ////// Remove from file section + clean FileSpec (delete from logo tables)
                ////needSection.deleteFileSpecById(idOfFileSpec, function () {
                ////ths[fileSpecProp.addtData.nestedClientId](null);
                ////ths[fileSpecProp.clientId](null);
                ////});
            };

            /** Select file for any image */
            this.selectImgFileSpec = function (fileSpecProp) {
                ////console.log();
                var needSection = ths.getSectionByPatternId('company-summary');
                // Select file section with logos (load and unselect files)
                ths.selectFileSection(needSection);

                function mgrCallback() {
                    ths.modalFileMgr.okError('');
                    // Select file from file manager
                    var selectedFileSpecs = ko.unwrap(needSection.listOfFileSpec).filter(function (elem) {
                        return ko.unwrap(elem.isSelected);
                    });

                    if (selectedFileSpecs.length !== 1) {
                        ths.modalFileMgr.okError('need to select one file');
                        return;
                    }

                    // Get prop id
                    ths[fileSpecProp.addtData.nestedClientId](selectedFileSpecs[0].id);
                    ths.save();
                    ths.modalFileMgr.hide();
                    // Change sketch (create if not exists)
                    ////sketchOfWellService.put(ths.idOfWell, {
                    ////    idOfWell: ths.idOfWell,
                    ////    idOfFileSpec: selectedFileSpecs[0].id,
                    ////    name: ko.unwrap(selectedFileSpecs[0].name) || '',
                    ////    description: ko.unwrap(ths.description) || ''
                    ////}).done(function (resSketch) {
                    ////    ths.name(resSketch.Name);
                    ////    ths.description(resSketch.Description);
                    ////    ths.idOfFileSpec(resSketch.IdOfFileSpec);
                    ////    ths.fileSpec(new FileSpec(resSketch.FileSpecDto));
                    ////    tmpModalFileMgr.hide();
                    ////});
                }

                ths.modalFileMgr.okCallback(mgrCallback);
                ths.modalFileMgr.okDescription('Please select image for company logo');

                ths.modalFileMgr.show();
            };

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

                // Select ths
                ths.selectedWegion(wegionToSelect);

                // Select parents (not need)

                // Select summary section
                wegionToSelect.selectedSection(wegionToSelect.getSectionByPatternId('wegion-summary'));

                if (!initialData.isHistory) {
                    historyHelper.pushState('/companies/' + ths.id + '/well-regions/' + wegionToSelect.id);
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
                        if (tmpWegion.id === wegionId) {
                            ths.selectWegion(tmpWegion, initialData);
                        }
                    });
                }
            };

            /** Delete well region */
            this.removeChild = function (wellRegionForDelete) {
                if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(wellRegionForDelete.name) + '"?')) {
                    wegionService.remove(wellRegionForDelete.id).done(function () {
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
                    wegionService.post({
                        'Name': $(inputName).val(),
                        'Description': '',
                        'CompanyId': ths.id
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
                companyService.put(ths.id, ths.toDto()).done(function (r) {
                    // Calculated properties on the server
                    var tmpFileSpecOfLogoProp = ths.propSpecList.filter(function (elem) {
                        return elem.clientId === 'fileSpecOfLogo';
                    })[0];

                    if (!tmpFileSpecOfLogoProp) { throw new ReferenceError('No fileSpecOfLogo property for company model'); }

                    // Value of logo file from server
                    var tmpValueOfFileSpecOfLogo = r[tmpFileSpecOfLogoProp.serverId];

                    if (tmpValueOfFileSpecOfLogo) {
                        ths[tmpFileSpecOfLogoProp.clientId](new FileSpec(tmpValueOfFileSpecOfLogo));
                    }
                    else {
                        ths[tmpFileSpecOfLogoProp.clientId](null);
                    }
                });
            };

            /** 
            * Load wegions of this company
            * @param {object} [initialData] - Initial data
            */
            this.loadWegions = function (initialData) {
                initialData = initialData || {};

                if (!ko.unwrap(ths.isLoadedWegions)) {
                    wegionService.getInclusive(ths.id).done(function (response) {
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
                    Id: ths.id
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