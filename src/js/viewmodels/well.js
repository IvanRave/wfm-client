/** @module */
define(['viewmodels/bases/stage-base',
    'viewmodels/bases/stage-parent-base',
    'viewmodels/sketch-of-well'],
    function (VwmStageBase,
        VwmStageParentBase,
        VwmSketchOfWell) {
        'use strict';

        /**
        * Well view model
        * @constructor
        */
        var exports = function (mdlWell, koSlcVwmWell, defaultSlcData, fmgrLink) {
            var ths = this;

            this.mdlStage = mdlWell;

            this.unq = mdlWell.id;

            this.fmgr = fmgrLink;

            VwmStageParentBase.call(this, koSlcVwmWell);

            // Has sections and widgets
            VwmStageBase.call(this, defaultSlcData.wellSectionId);

            //mdlSketchOfWell, koWellUnzOfSlcVwmSectionFmg, koSlcVwmSectionFmg,  fmgrLink
            this.vwmSketchOfWell = new VwmSketchOfWell(ths.mdlStage.sketchOfWell, ths.unzOfSlcVwmSectionFmg, ths.slcVwmSectionFmg, ths.fmgr);
        };

        return exports;
    });