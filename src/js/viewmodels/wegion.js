/** @module */
define(['knockout',
    'viewmodels/wield',
    'viewmodels/bases/stage-child-base',
    'viewmodels/bases/stage-base',
    'viewmodels/bases/stage-parent-base'],
    function (ko, VwmWield, VwmStageChildBase, VwmStageBase, VwmStageParentBase) {
        'use strict';

        /**
        * Well region view model
        * @constructor
        */
        var exports = function (mdlWegion, koSlcVwmStage, defaultSlcData, fmgrLink) {
            var ths = this;

            /**
            * Model wegion
            * @type {<module:models/wegion>}
            */
            this.mdlStage = mdlWegion;

            /** Unique id for view */
            this.unq = mdlWegion.id;

            /** Link to file manager of company */
            this.fmgr = fmgrLink;

            /**
            * List of views of well fields 
            * @type {Array.<module:viewmodels/wield>}
            */
            this.listOfVwmChild = ko.computed({
                read: function () {
                    return ko.unwrap(mdlWegion.wields).map(function (elem) {
                        return new VwmWield(elem, ths.slcVwmChild, defaultSlcData, ths.fmgr);
                    });
                },
                deferEvaluation: true
            });

            VwmStageParentBase.call(ths, koSlcVwmStage);
            VwmStageChildBase.call(this, defaultSlcData.wieldId);
            VwmStageBase.call(this, defaultSlcData.wegionSectionId);
        };

        return exports;
    });