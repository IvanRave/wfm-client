/** @module */
define(['knockout',
    'viewmodels/well',
    'viewmodels/bases/stage-child-base',
    'viewmodels/bases/stage-base',
    'viewmodels/bases/stage-parent-base'],
    function (ko,
        VwmWell,
        VwmStageChildBase,
        VwmStageBase,
        VwmStageParentBase) {
        'use strict';

        /**
        * Well group view model
        * @constructor
        */
        var exports = function (mdlWroup, koSlcVwmWroup, defaultSlcData, fmgrLink) {
            var ths = this;

            this.mdlStage = mdlWroup;

            this.unq = mdlWroup.id;

            this.fmgr = fmgrLink;

            /**
            * List of views of wells
            * @type {Array.<module:viewmodels/well>}
            */
            this.listOfVwmChild = ko.computed({
                read: function () {
                    return ko.unwrap(mdlWroup.wells).map(function (elem) {
                        return new VwmWell(elem, ths.slcVwmChild, defaultSlcData, ths.fmgr);
                    });
                },
                deferEvaluation: true
            });

            // Has a parent with few wields
            VwmStageParentBase.call(this, koSlcVwmWroup);
            // Has a children (wroups)
            VwmStageChildBase.call(this, defaultSlcData.wellId);
            // Has sections and widgets
            VwmStageBase.call(this, defaultSlcData.wroupSectionId);
        };

        return exports;
    });