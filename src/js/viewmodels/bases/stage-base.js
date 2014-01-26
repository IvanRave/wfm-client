/** @module */
define(['knockout',
    'helpers/history-helper',
    'viewmodels/section-of-stage'], function (ko, historyHelper, VwmStageSection) {
        'use strict';

        /**
        * Base for stages
        * @constructor
        */
        var exports = function (koSlcVwmStage, partOfUnzOfSlcVwmSectionWrk) {

            var ths = this;
            ////console.log('defaultSectionId', defaultSectionId);
            /** By default: view unique id = model.id */
            this.unq = ths.mdlStage.id;

            /** List of section views */
            this.listOfVwmSection = ko.computed({
                read: function () {
                    var tmpListOfSection = ko.unwrap(ths.mdlStage.listOfSection);
                    return tmpListOfSection.map(function (elem) {
                        return new VwmStageSection(elem, ths);
                    });
                },
                deferEvaluation: true
            });

            /**
            * Whether menu item is opened: showed inner object in menu without main content
            * @type {boolean}
            */
            this.isOpenItem = ko.observable(false);

            /** Toggle isOpen state */
            this.toggleItem = function () {
                ths.isOpenItem(!ko.unwrap(ths.isOpenItem));
            };

            /** 
            * Whether region is selected
            *    Company has wegions. This wegion is selected. Always true
            * @type {boolean}
            */
            this.isSlcVwmStage = ko.computed({
                read: function () {
                    // TODO: Check
                    // Selected child of this stage (stage with lewer level)
                    var tmpSlcVwmStage = ko.unwrap(koSlcVwmStage);
                    if (tmpSlcVwmStage) {
                        return (ths.unq === tmpSlcVwmStage.unq);
                    }
                    return false;
                },
                deferEvaluation: true
            });

            /** 
            * Whether stage content is selected and showed on the page (child object are not selected)
            * @type {boolean}
            */
            this.isShowedVwmStage = ko.computed({
                read: function () {
                    // If stage is selected
                    if (ko.unwrap(ths.isSlcVwmStage)) {
                        // And no selected childs
                        // Well stage is always selected (has no children)
                        if (!ko.unwrap(ths.slcVwmChild)) {
                            console.log('stage is showed', ths.mdlStage.stageKey);
                            return true;
                        }
                    }

                    return false;
                },
                deferEvaluation: true
            });

            /** Selected section in file manager */
            this.slcVwmSectionFmg = ko.observable();

            /** Select file section (in file manager) */
            this.selectVwmSectionFmg = function (vwmSectionToSelect) {
                // Load files from server (if not loaded)
                // If loaded - clean selected states
                vwmSectionToSelect.mdlSection.loadListOfFileSpec();

                // Set as a selected to show files
                ths.slcVwmSectionFmg(vwmSectionToSelect);
            };

            /** Id of view of selected section: unz = section pattern */
            this.unzOfSlcVwmSectionWrk = ko.observable();

            /** Selected section in workspace */
            this.slcVwmSectionWrk = ko.computed({
                read: function () {
                    var tmpUnzOfSlcVwmSectionWrk = ko.unwrap(ths.unzOfSlcVwmSectionWrk);
                    if (tmpUnzOfSlcVwmSectionWrk) {
                        // Find section with this pattern id
                        return ko.unwrap(ths.listOfVwmSection).filter(function (elem) {
                            return elem.unz === tmpUnzOfSlcVwmSectionWrk;
                        })[0];
                    }
                    else if (tmpUnzOfSlcVwmSectionWrk === null) {
                        return null;
                    }
                },
                deferEvaluation: true
            });

            /** Select section */
            this.selectVwmSectionWrk = function (vwmSectionToSelect) {
                // Select id -> auto selection for view
                ths.unzOfSlcVwmSectionWrk(vwmSectionToSelect.unz);
            };

            /** Choose dashboard (no section */
            this.unselectVwmSectionWrk = function () {
                ths.unzOfSlcVwmSectionWrk(null);
            };

            /** When change selected section */
            this.slcVwmSectionWrk.subscribe(function (vwmSectionItem) {
                var navigationArr = historyHelper.getNavigationArr(ths.mdlStage);
                console.log('unz: ', vwmSectionItem);
                if (vwmSectionItem) {
                    if (ths.mdlStage.loadSectionContent) {
                        ths.mdlStage.loadSectionContent(vwmSectionItem.mdlSection.sectionPatternId);
                    }

                    // Add data to the url
                    navigationArr.push('sections');
                    navigationArr.push(vwmSectionItem.mdlSection.sectionPatternId.split('-')[1]);
                }
                else if (vwmSectionItem === null) {
                    console.log('unselect section (load dashboard)');

                    ths.mdlStage.loadWidgouts();

                    if (ths.mdlStage.loadDashboard) {
                        ths.mdlStage.loadDashboard();
                    }
                }
                else {
                    throw new Error('VwmSection can not be undefined (only in init step)');
                }

                historyHelper.pushState('/' + navigationArr.join('/'));
                ////console.log('mdlStageisShowed: ' + ko.unwrap(ths.isShowedVwmStage));
            });

            // When default section is defined (through url or smth else)
            // Load its
            if (partOfUnzOfSlcVwmSectionWrk) {
                // All sections loaded with stages
                // Section model contains all sections (loaded)

                // and load
                // Only once
                this.unzOfSlcVwmSectionWrk(ths.mdlStage.stageKey + '-' + partOfUnzOfSlcVwmSectionWrk);
                // Then delete, to not-repeat this value again
                partOfUnzOfSlcVwmSectionWrk = null;

                // Find need section
                ////var tmpNeedVwmSection = ko.unwrap(ths.listOfVwmSection).filter(function (elem) {
                ////    return elem.unz === ();
                ////})[0];

                ////if (!tmpNeedVwmSection) { throw new Error('Not found such section:' + partOfUnzOfSlcVwmSectionWrk); }
            }
            ////else {
            ////    // Select dashboard
            ////    this.unzOfSlcVwmSectionWrk(null);
            ////    ////this.unzOfSlcVwmSectionWrk(null);
            ////    ////this.unselectVwmSectionWrk();
            ////}
        };

        return exports;
    });