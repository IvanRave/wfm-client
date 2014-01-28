/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /**
    * Viewmodel: sketch of well
    * @constructor
    */
    var exports = function (mdlSketchOfWell, koWellUnzOfSlcVwmSectionFmg, koSlcVwmSectionFmg,  fmgrLink) {
        var ths = this;

        this.mdlSketchOfWell = mdlSketchOfWell;

        this.fmgr = fmgrLink;

        /** Create sketch from file: select file and create sketch */
        this.createSketchFromFile = function () {
            var tmpMdlWell = ths.mdlSketchOfWell.getWell();

            // Select file section with sketches (load and unselect files)
            koWellUnzOfSlcVwmSectionFmg(tmpMdlWell.stageKey + '-sketch');
            

            ////var needSection = tmpMdlWell.getSectionByPatternId('well-sketch');
            ////ths.getWell().selectFileSection(needSection);
            ////var tmpModalFileMgr = ths.getWell().getWellGroup().getWellField().getWellRegion().getCompany().modalFileMgr;

            // Calback for selected file
            function mgrCallback() {
                ths.fmgr.okError('');

                var tmpSlcVwmSection = ko.unwrap(koSlcVwmSectionFmg);

                if (!tmpSlcVwmSection) { throw new Error('No selected section'); }

                // Select file from file manager
                var selectedFileSpecs = ko.unwrap(tmpSlcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
                    return ko.unwrap(elem.isSelected);
                });

                if (selectedFileSpecs.length !== 1) {
                    ths.fmgr.okError('need to select one file');
                    return;
                }

                ths.mdlSketchOfWell.putSketchOfWell(selectedFileSpecs[0].id, ko.unwrap(selectedFileSpecs[0].name), function () {
                    ths.fmgr.hide();
                });
            }

            // Add to observable
            ths.fmgr.okCallback(mgrCallback);

            // Notification
            ths.fmgr.okDescription('Please select a file for a sketch image');

            // Open file manager
            ths.fmgr.show();
        };
    };

    return exports;
});