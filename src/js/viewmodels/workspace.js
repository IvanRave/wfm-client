/** @module */
define([
    'jquery',
    'knockout',
    'services/datacontext',
    'helpers/modal-helper',
    'helpers/app-helper',
    'models/user-profile',
    'helpers/history-helper',
    'helpers/knockout-lazy',
    'models/wfm-param-squad'], function ($, ko, datacontext, bootstrapModal, appHelper, UserProfile, historyHelper) {
        'use strict';

        // WfmParamSquadList (convert data objects into array)
        function importWfmParamSquadList(data) {
            return (data || []).map(function (item) { return datacontext.createWfmParamSquad(item); });
        }

        /**
        * Root view model
        * @constructor
        */
        var exports = function () {
            /** Alternative for this */
            var ths = this;

            /** 
            * Whether left tree menu with well regions, groups, fields, wells is visible
            * @type {boolean}
            */
            this.isVisibleMenu = ko.observable(true);

            // Left tree menu with well regions, groups, fields, wells
            this.toggleIsVisibleMenu = function () {
                ths.isVisibleMenu(!ko.unwrap(ths.isVisibleMenu));
            };

            this.sidebarWrapCss = ko.computed({
                read: function () {
                    return ko.unwrap(ths.isVisibleMenu) ? 'sidebar-wrap-visible' : 'hidden';
                },
                deferEvaluation: true
            });

            this.workAreaCss = ko.computed({
                read: function () {
                    return ko.unwrap(ths.isVisibleMenu) ? 'work-area' : '';
                },
                deferEvaluation: true
            });

            this.sidebarToggleCss = ko.computed({
                read: function () {
                    return ko.unwrap(ths.isVisibleMenu) ? 'sidebar-toggle-visible' : 'sidebar-toggle-hidden';
                },
                deferEvaluation: true
            });

            // =====================================Wfm parameters begin==========================================================
            this.wfmParamSquadList = ko.lazyObservableArray(function () {
                datacontext.getWfmParamSquadList({ is_inclusive: true }).done(function (r) {
                    ths.wfmParamSquadList(importWfmParamSquadList(r));
                });
            }, this);

            /** Get list of section patterns: lazy loading by first request */
            this.ListOfSectionPatternDto = ko.lazyObservableArray(function () {
                datacontext.getListOfSectionPattern().done(function (r) {
                    require(['models/section-pattern'], function (SectionPattern) {

                        function importListOfSectionPattern(data) {
                            return $.map(data || [], function (item) { return new SectionPattern(item); });
                        }

                        ths.ListOfSectionPatternDto(importListOfSectionPattern(r));
                    });
                });
            }, this);

            // Get all parameters from all groups as one dimensional array
            this.wfmParameterList = ko.computed({
                read: function () {
                    return $.map(ko.unwrap(ths.wfmParamSquadList), function (sqdElem) {
                        return $.map(ko.unwrap(sqdElem.wfmParameterList), function (prmElem) {
                            return prmElem;
                        });
                    });
                },
                deferEvaluation: true
            });
            // =====================================Wfm parameters end==========================================================

            // Test company Id with Guid format (this checks retry server check in WorkSpace view of Home controller
            ////if (!appHelper.isGuidValid(companyId)) {
            ////    var errValidMsg = 'Company id is not valid GUID';
            ////    alert(errValidMsg);
            ////    throw new TypeError(errValidMsg);
            ////}        


            // load list of well region, well field...
            ////function loadStructure() {
            ////    function getSucceeded(data) {
            ////        var mappedStructure = $.map(data, function (list) {
            ////            return new WellRegion(list, ths);
            ////        });

            ////        ths.wellRegionList(mappedStructure);

            ////        // route region/id/field/id/group/id/well/id
            ////        ////var choosedObj = getChoosedIdFromHash();
            ////        console.log(choosedObj);
            ////        var tmpRegion = appHelper.getElementByPropertyValue(ths.wellRegionList(), 'Id', choosedObj.regionId);
            ////        if (tmpRegion) {
            ////            ths.selectedWellRegion(tmpRegion);
            ////            tmpRegion.isOpenItem(true);
            ////            var tmpField = appHelper.getElementByPropertyValue(ths.selectedWellRegion().wields(), 'Id', choosedObj.fieldId);
            ////            if (tmpField) {
            ////                ths.selectedWellRegion().selectedWield(tmpField);
            ////                tmpField.isOpenItem(true);
            ////                var tmpGroup = appHelper.getElementByPropertyValue(ths.selectedWellRegion().selectedWield().wroups(), 'Id', choosedObj.groupId);
            ////                if (tmpGroup) {
            ////                    ths.selectedWellRegion().selectedWield().selectedWroup(tmpGroup);
            ////                    tmpGroup.isOpenItem(true);
            ////                    var tmpWell = appHelper.getElementByPropertyValue(ths.selectedWellRegion().selectedWield().selectedWroup().Wells(), 'Id', choosedObj.wellId);
            ////                    if (tmpWell) {
            ////                        ths.selectedWellRegion().selectedWield().selectedWroup().selectedWell(tmpWell);
            ////                        tmpWell.isOpenItem(true);
            ////                        // todo: change logic - when change selected id - need to execute additional logic
            ////                        if (choosedObj.sectionId) {
            ////                            tmpWell.selectedSectionByPatternId(choosedObj.sectionId);
            ////                        }
            ////                        else {
            ////                            // Null - show dashboard: load all widget layouts and data
            ////                            tmpWell.unselectSection();
            ////                        }
            ////                        // Apchive: previously - set summary as a default page
            ////                        ////else {
            ////                        ////    tmpWell.selectedSectionId(tmpWell.sectionList[0].id);
            ////                        ////}

            ////                        // this set selected well
            ////                        ////console.log(ths.selectedWellRegion().selectedWield().selectedWroup().selectedWell());
            ////                    }
            ////                }
            ////            }
            ////        }
            ////    }
            ////}

            //     loadStructure();

            /** 
            * User profile
            * @type {module:models/user-profile}
            */
            this.userProfile = new UserProfile(ths);

            /**
            * Whether current employee in edit mode: fast access for view
            * @type {boolean}
            */
            this.isEmployeeInEditMode = ko.computed({
                read: function () {
                    var currentEmployee = ko.unwrap(ths.userProfile.selectedEmployee);
                    if (currentEmployee){
                        return ko.unwrap(currentEmployee.isEditMode);
                    }
                },
                deferEvaluation: true
            });

            this.initialUrlData = ko.observable(historyHelper.getInitialData(document.location.hash.substring(1)));

            /** Auth user profile and load data if successful */
            this.userProfile.loadAccountInfo();

            /** Back, forward, refresh browser navigation */
            // TODO: back
            ////window.onpopstate = function () {
            ////    var stateData = historyHelper.getInitialData(document.location.hash.substring(1));
            ////    // When load any info - do not push info to history again
            ////    stateData.isHistory = true;
            ////    // Reload all data
            ////    ths.initialUrlData(stateData);

            ////    console.log('location: ' + document.location.hash + ', state: ' + JSON.stringify(stateData));

            ////    ths.userProfile.loadAccountInfo();
            ////};
        };

        return exports;
    });