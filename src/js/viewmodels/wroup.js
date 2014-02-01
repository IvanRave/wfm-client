/** @module */
define(['knockout',
    'viewmodels/well',
    'viewmodels/bases/stage-child-base',
    'viewmodels/bases/stage-base'],
    function (ko,
        VwmWell,
        VwmStageChildBase,
        VwmStageBase) {
        'use strict';

        /**
        * Well group view model
        * @constructor
        */
        var exports = function (mdlWroup, parentVwmWield, defaultSlcData) {
            var ths = this;

            this.mdlStage = mdlWroup;

            this.unq = mdlWroup.id;

            this.fmgr = parentVwmWield.fmgr;

            /**
            * List of views of wells
            * @type {Array.<module:viewmodels/well>}
            */
            this.listOfVwmChild = ko.computed({
                read: function () {
                    return ko.unwrap(mdlWroup.wells).map(function (elem) {
                        return new VwmWell(elem, ths, defaultSlcData);
                    });
                },
                deferEvaluation: true
            });

            // Has a children (wroups)
            VwmStageChildBase.call(this, defaultSlcData.wellId);
            // Has sections and widgets
            VwmStageBase.call(this, defaultSlcData.wroupSectionId, parentVwmWield.unqOfSlcVwmChild);

            /**
            * Select all ancestor's view models
            */
            this.selectAncestorVwms = function () {
                // 1. take parent view - company
                // 2. take parent view of employee - userprofile
                parentVwmWield.unqOfSlcVwmChild(ths.unq);
                parentVwmWield.selectAncestorVwms();
            };
        };

        return exports;
    });