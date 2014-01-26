/** @module */
define(['knockout', 'viewmodels/wegion',
    'viewmodels/bases/stage-base', 'viewmodels/bases/stage-child-base'], function (ko, VwmWegion, VwmStageBase, VwmStageChildBase) {
        'use strict';

        /**
        * Company view model
        * @constructor
        */
        var exports = function (mdlCompany, koSlcVwmStage, defaultSlcData) {

            /** Alternative of this */
            var ths = this;

            /**
            * Company data model
            * @type {<module:models/company>}
            */
            this.mdlStage = mdlCompany;

            /**
            * List of view of well regions
            * @type {Array.<module:viewmodels/wegion>}
            */
            this.listOfVwmChild = ko.computed({
                read: function () {
                    var tmpListOfMdlWegion = ko.unwrap(ths.mdlStage.wegions);
                    return tmpListOfMdlWegion.map(function (elem) {
                        return new VwmWegion(elem, ths.slcVwmChild, defaultSlcData);
                    });
                },
                deferEvaluation: true
            });

            /** Base for all stages: with selected view of wegion */
            VwmStageBase.call(this, koSlcVwmStage, defaultSlcData.companySectionId);

            /** Base for all stages with childs */
            VwmStageChildBase.call(this, defaultSlcData.wegionId);

            /////**
            ////* Well region view model (selected well region)
            ////* @type {<module:viewmodels/wegion>}
            ////*/
            ////this.vwmWegion = ko.computed({
            ////    read: function () {
            ////        var tmpSlcWegion = ko.unwrap(ths.mdlCompany.selectedWegion);
            ////        if (tmpSlcWegion) {
            ////            var tmpListOfVwmWegion = ko.unwrap(ths.listOfVwmWegion);
            ////            return tmpListOfVwmWegion.filter(function (elem) {
            ////                return elem.mdlWegion.id === mdlCompany.idOfSlcWegion;
            ////            })[0];
            ////        }
            ////    },
            ////    deferEvaluation: true
            ////});

            /**
            * Select well region
            * @param {module:models/wegion} wegionToSelect - Well region to select
            */
            ////this.selectVwmWegion = function (vwmWegionToSelect) {
            ////    ths.unqOfSlcVwmWegion(vwmWegionToSelect.unq);

            ////var wegionToSelect = vwmWegionToSelect.mdlWegion;
            /////** Initial function for all select stage functions */
            ////mdlCompany.selectChildStage(wegionToSelect);

            ////// 1. Check url to child stage
            ////if (defaultSlcData.wieldId) {
            ////    var needWield = wegionToSelect.getWieldById(defaultSlcData.wieldId);
            ////    if (needWield) {
            ////        wegionToSelect.selectWield(needWield);
            ////    }
            ////    else {
            ////        alert('Well field is not found');
            ////    }

            ////    delete defaultSlcData.wieldId;
            ////}
            ////else if (defaultSlcData.wegionSectionId) {
            ////    // Select section

            ////    var tmpSection = wegionToSelect.getSectionByPatternId('wegion-' + defaultSlcData.wegionSectionId);
            ////    wegionToSelect.selectSection(tmpSection);

            ////    // Remove section id from
            ////    delete defaultSlcData.wegionSectionId;
            ////}
            ////else {
            ////    // Show dashboard
            ////    wegionToSelect.unselectSection();
            ////    // Unselect child to show parent content
            ////    wegionToSelect.selectedWield(null);
            ////}

            ////// Set as selected: only after select all children
            ////ths.slcVwmWegion.idOfSlcWegion(wegionToSelect.id);

            // Select parents (not need)
            ////};
        };

        return exports;
    });