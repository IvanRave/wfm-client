/** @module */
define(['knockout',
    'helpers/history-helper',
    'viewmodels/section-of-stage',
    'viewmodels/widgout'],
    function (ko,
        historyHelper,
        VwmStageSection,
        VwmWidgout) {
        'use strict';

        /**
        * Base for stages
        * @constructor
        */
        var exports = function (partOfUnzOfSlcVwmSectionWrk) {

            var ths = this;
            ////console.log('defaultSectionId', defaultSectionId);
            /////** By default: view unique id = model.id */
            ////this.unq = ths.mdlStage.id;

            /** 
            * Whether stage content is selected and showed on the page (child object are not selected)
            * @type {boolean}
            */
            this.isShowedVwmStage = ko.computed({
                read: function () {
                    // If stage is selected (or not exists)
                    if (ko.unwrap(ths.isSlcVwmStage) !== false) {
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

            /** Unique id of selected section in file manager */
            this.unzOfSlcVwmSectionFmg = ko.observable();

            /** Selected section in file manager */
            this.slcVwmSectionFmg = ko.computed({
                read: function () {
                    var tmpUnzOfSlcVwmSection = ko.unwrap(ths.unzOfSlcVwmSectionFmg);
                    if (tmpUnzOfSlcVwmSection) {
                        // Find section with this pattern id
                        return ko.unwrap(ths.listOfVwmSection).filter(function (elem) {
                            return elem.unz === tmpUnzOfSlcVwmSection;
                        })[0];
                    }
                    else if (tmpUnzOfSlcVwmSection === null) {
                        return null;
                    }
                },
                deferEvaluation: true
            });

            /** Select file section (in file manager) */
            this.selectVwmSectionFmg = function (vwmSectionToSelect) {

                // Load files from server (if not loaded)
                // If loaded - clean selected states
                vwmSectionToSelect.mdlSection.loadListOfFileSpec();

                // Set as a selected to show files
                ths.unzOfSlcVwmSectionFmg(vwmSectionToSelect.unz);
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
                console.log('subscribe section', vwmSectionItem);
                var navigationArr = historyHelper.getNavigationArr(ths.mdlStage);
                
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

            /**
            * List of views of widget layouts
            * @type {Array.<module:viewmodels/widgout>}
            */
            this.listOfVwmWidgout = ko.computed({
                read: function () {
                    return ko.unwrap(ths.mdlStage.widgouts).map(function (elem) {
                        return new VwmWidgout(elem, ths.fmgr);
                    });
                },
                deferEvaluation: true
            });

            /** Selected widget layouts: may be defined by default from client storage (cookies..) */
            this.slcVwmWidgout = ko.observable();

            /** Remove widget layout from this stage */
            this.removeVwmWidgout = function (vwmWidgoutToRemove) {
                // Remove model -> autoremoving viewmodel
                ths.mdlStage.removeWidgout(vwmWidgoutToRemove.mdlWidgout);
            };

            /** Select file for any image */
            this.selectImgFileSpec = function (fileSpecProp) {
                // Every stage has property fmgr, which is link to company fmgr
                // Get file manager object from company view
                // Show file manager
                // Select file
                // Send to need function

                ths.unzOfSlcVwmSectionFmg(ths.mdlStage.stageKey + '-summary');

                ths.fmgr.okCallback(function () {
                    ths.fmgr.okError('');
                    // Select file from file manager
                    var slcVwmSection = ko.unwrap(ths.slcVwmSectionFmg);

                    if (!slcVwmSection) { throw new Error('No selected section when select image file for stage propery'); }

                    var selectedFileSpecs = ko.unwrap(slcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
                        return ko.unwrap(elem.isSelected);
                    });

                    if (selectedFileSpecs.length !== 1) {
                        ths.fmgr.okError('need to select one file');
                        return;
                    }

                    // Get prop id
                    ths.mdlStage[fileSpecProp.addtData.nestedClientId](selectedFileSpecs[0].id);
                    ths.mdlStage.save();
                    ths.fmgr.hide();
                });

                ths.fmgr.okDescription('Please select one image');

                ths.fmgr.show();
            };

            // ==================================== Data loading ================================================

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