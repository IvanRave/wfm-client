/** @module */
define(['knockout',
    'models/file-spec',
    'models/widgout',
    'services/widgout',
    'helpers/history-helper',
    'constants/stage-constants'], function (ko, FileSpec, Widgout, widgoutService, historyHelper, stageConstants) {
        'use strict';

        /** Import widget layouts to the stage */
        function importWidgouts(data, parentItem) {
            return (data || []).map(function (item) { return new Widgout(item, parentItem); });
        }

        /**
        * Get array for navigation url: builded from childstage and sections
        * @param {object} childStage - Child stage: well, wroup...
        */
        function getNavigationArr(childStage) {
            var navigationArr;
            switch (childStage.stageKey) {
                case stageConstants.company.id:
                    navigationArr = [stageConstants.company.plural, childStage.id];
                    break;
                case stageConstants.wegion.id:
                    navigationArr = [stageConstants.company.plural, childStage.getCompany().id,
                        stageConstants.wegion.plural, childStage.id];
                    break;
                case stageConstants.wield.id:
                    navigationArr = [stageConstants.company.plural, childStage.getWellRegion().getCompany().id,
                        stageConstants.wegion.plural, childStage.getWellRegion().id,
                        stageConstants.wield.plural, childStage.id];
                    break;
                case stageConstants.wroup.id:
                    navigationArr = [stageConstants.company.plural, childStage.getWellField().getWellRegion().getCompany().id,
                        stageConstants.wegion.plural, childStage.getWellField().getWellRegion().id,
                        stageConstants.wield.plural, childStage.getWellField().id,
                        stageConstants.wroup.plural, childStage.id];
                    break;
                case stageConstants.well.id:
                    navigationArr = [stageConstants.company.plural, childStage.getWellGroup().getWellField().getWellRegion().getCompany().id,
                        stageConstants.wegion.plural, childStage.getWellGroup().getWellField().getWellRegion().id,
                        stageConstants.wield.plural, childStage.getWellGroup().getWellField().id,
                        stageConstants.wroup.plural, childStage.getWellGroup().id,
                        stageConstants.well.plural, childStage.id];
                    break;
            }

            return navigationArr;
        }

        /**
        * Base for all stages: well, group, region etc.
        */
        var exports = function (data) {
            var ths = this;

            /** Props values: all observables */
            this.propSpecList.forEach(function (prop) {
                if (prop.tpe === 'FileLine') {
                    // Create new observable file specification
                    ths[prop.clientId] = ko.observable();
                    // If file exists - create object
                    if (data[prop.serverId]) {
                        ths[prop.clientId](new FileSpec(data[prop.serverId]));
                    }
                }
                else {
                    ths[prop.clientId] = ko.observable(data[prop.serverId]);
                }
            });

            /** Get need property from array */
            this.getPropSpecByClientId = function (clientId) {
                var filteredProps = ths.propSpecList.filter(function (elem) {
                    return elem.clientId === clientId;
                });

                return filteredProps[0];
            };

            /** List of sections */
            this.listOfSection = ko.observableArray();

            /** Selected section */
            this.selectedSection = ko.observable();

            /** Selected section in file manager */
            this.selectedFileSection = ko.observable();

            /** Select file section (in file manager) */
            this.selectFileSection = function (fileSectionToSelect) {
                // Load files from server (if not loaded)
                // If loaded - clean selected states
                fileSectionToSelect.loadListOfFileSpec();

                // Set as a selected to show files
                ths.selectedFileSection(fileSectionToSelect);
            };

            /**
            * Get section by section pattern id: wrap for selectFileSection function
            * @param {string} idOfPattern - Id of section pattern, like 'wield-map', 'wield-summary'
            */
            this.getSectionByPatternId = function (idOfPattern) {
                var tmpList = ko.unwrap(ths.listOfSection);

                return tmpList.filter(function (elem) {
                    return elem.sectionPatternId === idOfPattern;
                })[0];
            };

            /**
            * Whether menu item is opened: showed inner object in menu without main content
            * @type {boolean}
            */
            this.isOpenItem = ko.observable(false);

            /** Toggle isOpen state */
            this.toggleItem = function () {
                ths.isOpenItem(!ko.unwrap(ths.isOpenItem));
            };

            /** Widget layouts of this stage */
            this.widgouts = ko.observableArray();

            /** Selected widget layouts: may be defined by default from client storage (cookies..) */
            this.slcWidgout = ko.observable();

            /**
            * Is loaded widget layouts
            * @type {boolean}
            */
            this.isLoadedWidgouts = ko.observable(false);

            /** Load widget layouts for stage */
            this.loadWidgouts = function () {
                if (!ko.unwrap(ths.isLoadedWidgouts)) {
                    widgoutService.get(ths.stageKey, ths.id || ths.Id).done(function (res) {
                        ths.widgouts(importWidgouts(res, ths));
                        ths.isLoadedWidgouts(true);
                    });
                }
            };

            /** Possible widget layout list to insert */
            this.widgoutTemplates = widgoutService.getWidgoutTemplates();

            /** Selected possible widget layout for adding to widget layout list */
            this.slcWidgoutTemplate = ko.observable();

            /** Create widgout */
            this.postWidgout = function () {
                var tmpWidgoutTemlate = ko.unwrap(ths.slcWidgoutTemplate);
                if (tmpWidgoutTemlate) {
                    widgoutService.post(ths.stageKey, ths.id || ths.Id, tmpWidgoutTemlate).done(function (createdWellWidgoutData) {
                        var widgoutNew = new Widgout(createdWellWidgoutData, ths);
                        ths.widgouts.push(widgoutNew);
                        ths.slcWidgout(widgoutNew);
                        ths.slcWidgoutTemplate(null);
                    });
                }
            };

            /** Remove widget layout from this stage */
            this.removeWidgout = function () {
                var widgoutToDelete = ko.unwrap(ths.slcWidgout);
                if (widgoutToDelete) {
                    if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(widgoutToDelete.name) + '"?')) {
                        widgoutService.remove(ths.stageKey, ths.id || ths.Id, widgoutToDelete.id).done(function () {
                            ths.widgouts.remove(widgoutToDelete);
                        });
                    }
                }
            };

            /**
            * List of section patterns for current stage (names, ids, etc.)
            *    Section patterns where idOfStage === stageKey
            * @type {Array.<module:models/section-pattern>}
            */
            this.stagePatterns = ko.computed({
                read: function () {
                    // List of all section patterns
                    var tmpAllPatterns = ko.unwrap(ths.getRootViewModel().ListOfSectionPatternDto);
                    return tmpAllPatterns.filter(function (elem) {
                        return elem.idOfStage === ths.stageKey;
                    });
                },
                deferEvaluation: true
            });

            /**
            * List of patterns for widgets
            * @type {Array.<module:models/section-pattern>}
            */
            this.stagePatternsForWidget = ko.computed({
                read: function () {
                    var tmpStagePatterns = ko.unwrap(ths.stagePatterns);
                    return tmpStagePatterns.filter(function (elem) {
                        return elem.isWidget;
                    });
                },
                deferEvaluation: true
            });

            /** Select section */
            this.selectSection = function (sectionToSelect) {
                if (!sectionToSelect) { return; }
                ths.selectedSection(sectionToSelect);
                if (ths.loadSectionContent) {
                    ths.loadSectionContent(sectionToSelect.sectionPatternId);
                }

                // Add data to the url
                var navigationArr = getNavigationArr(ths);

                navigationArr.push('sections');
                navigationArr.push(sectionToSelect.sectionPatternId.split('-')[1]);

                if (navigationArr) {
                    historyHelper.pushState('/' + navigationArr.join('/'));
                }
                else {
                    throw new Error('No stage for navigation url in stage-base');
                }
            };

            /** Choose dashboard (no section */
            this.unselectSection = function () {
                ths.selectedSection(null);
                ths.loadWidgouts();

                if (ths.loadDashboard) {
                    ths.loadDashboard();
                }

                var navigationArr = getNavigationArr(ths);
                if (navigationArr) {
                    historyHelper.pushState('/' + navigationArr.join('/'));
                }
                else {
                    throw new Error('Unselect section: no stage for navigation url in stage-base');
                }
            };

            /**
            * Select child stage: initial function for all 'select child' on every stage
            * @param {object} childStage - Child stage: like well, wroup, wield, wegion, company
            */
            this.selectChildStage = function (childStage) {
                childStage.isOpenItem(true);



                // Push to the navigation url: no need 
                // When you select stage, then selected any of the sections (or unselect section)
                // On this moment url will be changed
                // By default: 
                // 1. Load section from url
                // 2. Load section from previous selected stage from the same level
                // If not: unselect sections (show dashboard) //childStage.unselectSection();

                ////var tmpInitialUrlData = ko.unwrap(ths.getRootViewModel().initialUrlData);
                ////console.log('initialUrlData', tmpInitialUrlData);
                ////var navigationArr = getNavigationArr(childStage);

                ////if (navigationArr) {
                ////    historyHelper.pushState('/' + navigationArr.join('/'));
                ////}
                ////else {
                ////    throw new Error('SelectChildStage: no stage for navigation url in stage-base');
                ////}

            };
        };

        return exports;
    });