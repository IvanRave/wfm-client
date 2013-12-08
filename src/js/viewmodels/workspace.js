/** @module */
define([
    'jquery',
    'knockout',
    'services/datacontext',
    'helpers/modal-helper',
    'helpers/app-helper',
    'models/user-profile',
    'helpers/knockout-lazy'], function ($, ko, datacontext, bootstrapModal, appHelper, UserProfile) {
    'use strict';

    var exports = function (companyId, choosedObj) {
        // Test company Id with Guid format (this checks retry server check in WorkSpace view of Home controller
        if (!appHelper.isGuidValid(companyId)) {
            var errValidMsg = 'Company id is not valid GUID';
            alert(errValidMsg);
            throw new TypeError(errValidMsg);
        }        

        var self = this;

        // Left tree menu with well regions, groups, fields, wells
        self.isVisibleMenu = ko.observable(true);

        // Left tree menu with well regions, groups, fields, wells
        self.toggleIsVisibleMenu = function () {
            self.isVisibleMenu(!ko.unwrap(self.isVisibleMenu));
        };

        self.sidebarWrapCss = ko.computed({
            read: function () {
                return ko.unwrap(self.isVisibleMenu) ? 'sidebar-wrap-visible' : 'hidden';
            },
            deferEvaluation: true
        });

        self.workAreaCss = ko.computed({
            read: function () {
                return ko.unwrap(self.isVisibleMenu) ? 'work-area' : '';
            },
            deferEvaluation: true
        });

        self.sidebarToggleCss = ko.computed({
            read: function () {
                return ko.unwrap(self.isVisibleMenu) ? 'sidebar-toggle-visible' : 'sidebar-toggle-hidden';
            },
            deferEvaluation: true
        });

        // =====================================Wfm parameters begin==========================================================
        self.wfmParamSquadList = ko.lazyObservableArray(function () {
            datacontext.getWfmParamSquadList({ is_inclusive: true }).done(function (r) {
                require(['models/wfm-param-squad'], function () {
                    // WfmParamSquadList (convert data objects into array)
                    function importWfmParamSquadList(data) {
                        return $.map(data || [], function (item) { return datacontext.createWfmParamSquad(item); });
                    }

                    self.wfmParamSquadList(importWfmParamSquadList(r));
                });
            });
        }, self);

        /** Get list of section patterns: lazy loading by first request */
        self.ListOfSectionPatternDto = ko.lazyObservableArray(function () {
            datacontext.getListOfSectionPattern().done(function (r) {
                require(['models/section-pattern'], function (SectionPattern) {

                    function importListOfSectionPattern(data) {
                        return $.map(data || [], function (item) { return new SectionPattern(item); });
                    }

                    self.ListOfSectionPatternDto(importListOfSectionPattern(r));
                });
            });
        }, self);

        // Get all parameters from all groups as one dimensional array
        self.wfmParameterList = ko.computed({
            read: function () {
                return $.map(ko.unwrap(self.wfmParamSquadList), function (sqdElem) {
                    return $.map(ko.unwrap(sqdElem.wfmParameterList), function (prmElem) {
                        return prmElem;
                    });
                });
            },
            deferEvaluation: true
        });
        // =====================================Wfm parameters end==========================================================

        // TODO: back after repair getUserProfile();    
        // TODO: move selectItem() logic to parent objects:
        // well.selectWell() => wellGroup.selectWell()

        console.log(choosedObj);

        // load list of well region, well field...
        ////function loadStructure() {
        ////    function getSucceeded(data) {
        ////        var mappedStructure = $.map(data, function (list) {
        ////            return new WellRegion(list, self);
        ////        });

        ////        self.wellRegionList(mappedStructure);

        ////        // route region/id/field/id/group/id/well/id
        ////        ////var choosedObj = getChoosedIdFromHash();
        ////        console.log(choosedObj);
        ////        var tmpRegion = appHelper.getElementByPropertyValue(self.wellRegionList(), 'Id', choosedObj.regionId);
        ////        if (tmpRegion) {
        ////            self.selectedWellRegion(tmpRegion);
        ////            tmpRegion.isOpenItem(true);
        ////            var tmpField = appHelper.getElementByPropertyValue(self.selectedWellRegion().WellFields(), 'Id', choosedObj.fieldId);
        ////            if (tmpField) {
        ////                self.selectedWellRegion().selectedWellField(tmpField);
        ////                tmpField.isOpenItem(true);
        ////                var tmpGroup = appHelper.getElementByPropertyValue(self.selectedWellRegion().selectedWellField().WellGroups(), 'Id', choosedObj.groupId);
        ////                if (tmpGroup) {
        ////                    self.selectedWellRegion().selectedWellField().selectedWellGroup(tmpGroup);
        ////                    tmpGroup.isOpenItem(true);
        ////                    var tmpWell = appHelper.getElementByPropertyValue(self.selectedWellRegion().selectedWellField().selectedWellGroup().Wells(), 'Id', choosedObj.wellId);
        ////                    if (tmpWell) {
        ////                        self.selectedWellRegion().selectedWellField().selectedWellGroup().selectedWell(tmpWell);
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
        ////                        ////console.log(self.selectedWellRegion().selectedWellField().selectedWellGroup().selectedWell());
        ////                    }
        ////                }
        ////            }
        ////        }
        ////    }

        ////    datacontext.getWellRegionList({
        ////        company_id: companyId,
        ////        is_inclusive: true
        ////    }).done(getSucceeded);
        ////}

        //     loadStructure();

        /** 
        * User profile
        * @type {module:models/user-profile}
        */
        self.userProfile = new UserProfile(self);

        /** Load employees for user profile */
        self.userProfile.loadEmployees(companyId);
    };

    return exports;
});