/** @module */
define(['knockout',
    'viewmodels/wield',
    'viewmodels/bases/stage-child-base',
    'viewmodels/bases/stage-base'],
    function (ko, VwmWield, VwmStageChildBase, VwmStageBase) {
        'use strict';

        /**
        * Well region view model
        * @constructor
        */
        var exports = function (mdlWegion, parentVwmCompany, defaultSlcData) {
            var ths = this;

            /**
            * Model wegion
            * @type {module:models/wegion}
            */
            this.mdlStage = mdlWegion;

            /** Unique id for view */
            this.unq = mdlWegion.id;

            /** Link to file manager of company */
            this.fmgr = parentVwmCompany.fmgr;

            /**
            * List of views of well fields 
            * @type {Array.<module:viewmodels/wield>}
            */
            this.listOfVwmChild = ko.computed({
                read: function () {
                    return ko.unwrap(mdlWegion.wields).map(function (elem) {
                        return new VwmWield(elem, ths, defaultSlcData);
                    });
                },
                deferEvaluation: true
            });

            VwmStageChildBase.call(this, defaultSlcData.wieldId);
            VwmStageBase.call(this, defaultSlcData.wegionSectionId, parentVwmCompany.unqOfSlcVwmChild);

            /**
            * Select all ancestor's view models
            */
            this.selectAncestorVwms = function () {
                // 1. take parent view - company
                // 2. take parent view of employee - userprofile
                parentVwmCompany.unqOfSlcVwmChild(ths.unq);
                parentVwmCompany.selectAncestorVwms();
            };
        };

        return exports;
    });