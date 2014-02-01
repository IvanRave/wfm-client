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

            this.selectAncestorVwms = function () {
                parentVwmWield.unqOfSlcVwmChild(ths.unq);
                parentVwmWield.selectAncestorVwms();
            };
        };

        return exports;
    });