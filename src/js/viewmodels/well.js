/** @module */
define(['viewmodels/bases/stage-base',
    'viewmodels/bases/stage-parent-base'],
    function (VwmStageBase,
        VwmStageParentBase) {
        'use strict';

        /**
        * Well view model
        * @constructor
        */
        var exports = function (mdlWell, koSlcVwmWell, defaultSlcData, fmgrLink) {
            ////var ths = this;

            this.mdlStage = mdlWell;

            this.unq = mdlWell.id;

            this.fmgr = fmgrLink;

            // TODO: add other fields
            VwmStageParentBase.call(this, koSlcVwmWell);

            // Has sections and widgets
            VwmStageBase.call(this, defaultSlcData.wellSectionId);
        };

        return exports;
    });