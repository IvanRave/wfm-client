/** @module */
define(['knockout',
    'viewmodels/bases/stage-base',
    'viewmodels/sketch-of-well',
    'viewmodels/volume-of-well',
    'viewmodels/scope-of-history-of-well'],
    function (ko,
        VwmStageBase,
        VwmSketchOfWell,
        VwmVolumeOfWell,
        VwmScopeOfHistoryOfWell) {
        'use strict';

        /**
        * Well view model
        * @constructor
        */
        var exports = function (mdlWell, koUnqOfSlcVwmWell, defaultSlcData, fmgrLink) {
            var ths = this;

            this.mdlStage = mdlWell;

            this.unq = mdlWell.id;

            this.fmgr = fmgrLink;

            // Has sections and widgets
            VwmStageBase.call(this, defaultSlcData.wellSectionId, koUnqOfSlcVwmWell);

            //mdlSketchOfWell, koWellUnzOfSlcVwmSectionFmg, koSlcVwmSectionFmg,  fmgrLink
            this.vwmSketchOfWell = new VwmSketchOfWell(ths.mdlStage.sketchOfWell, ths.unzOfSlcVwmSectionFmg, ths.slcVwmSectionFmg, ths.fmgr);

            /**
            * List of views of volume of well
            * @type {Array.<viewmodels/volume-of-well>}
            */
            this.listOfVwmVolumeOfWell = ko.computed({
                read: function () {
                    return ko.unwrap(ths.mdlStage.volumes).map(function (elem) {
                        return new VwmVolumeOfWell(elem, ths.slcVwmVolumeOfWell);
                    });
                },
                deferEvaluation: true
            });

            /**
            * Id of selected view, equals id of file spec (guid)
            * @type {string}
            */
            this.vidOfSlcVwmVolumeOfWell = ko.observable();

            /**
            * Selected view
            */
            this.slcVwmVolumeOfWell = ko.computed({
                read: function () {
                    var tmpVid = ko.unwrap(ths.vidOfSlcVwmVolumeOfWell);
                    console.log('computed: volume', tmpVid);
                    var tmpList = ko.unwrap(ths.listOfVwmVolumeOfWell);
                    if (tmpVid) {
                        return tmpList.filter(function (elem) {
                            return elem.vid === tmpVid;
                        })[0];
                    }
                    else {
                        if (tmpList.length > 0) {
                            // Computed observables doesn't execute from themself
                            ths.vidOfSlcVwmVolumeOfWell(tmpList[0].vid);
                            return tmpList[0];
                        }
                        // Select first element, if no selected
                        //   return tmpList[0];
                    }
                },
                deferEvaluation: true
            });

            /** Select view for volume of well */
            this.selectVwmVolumeOfWell = function (tmpVwm) {
                ths.vidOfSlcVwmVolumeOfWell(tmpVwm.vid);
            };

            /** Create volume from file: select file and create volume */
            this.createVolumeFromFile = function () {
                ths.unzOfSlcVwmSectionFmg(ths.mdlStage.stageKey + '-volume');

                // Calback for selected file
                function mgrCallback() {
                    ths.fmgr.okError('');

                    var tmpSlcVwmSection = ko.unwrap(ths.slcVwmSectionFmg);

                    if (!tmpSlcVwmSection) { throw new Error('No selected section'); }

                    // Select file from file manager
                    var selectedFileSpecs = ko.unwrap(tmpSlcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
                        return ko.unwrap(elem.isSelected);
                    });

                    if (selectedFileSpecs.length !== 1) {
                        ths.fmgr.okError('need to select one file');
                        return;
                    }

                    ths.mdlStage.postVolumeOfWell(selectedFileSpecs[0].id, ko.unwrap(selectedFileSpecs[0].name), function () {
                        // Success
                        ths.fmgr.hide();
                    }, function (jqXhr) {
                        // Error
                        if (jqXhr.status === 422) {
                            var resJson = jqXhr.responseJSON;
                            require(['helpers/lang-helper'], function (langHelper) {
                                var tmpProcessError = (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
                                ths.fmgr.okError(tmpProcessError);
                            });
                        }
                    });
                }

                // Add to observable
                ths.fmgr.okCallback(mgrCallback);

                // Notification
                ths.fmgr.okDescription('Please select a file for a volume');

                // Open file manager
                ths.fmgr.show();
            };
            
            this.vwmScopeOfHistoryOfWell = new VwmScopeOfHistoryOfWell({}, ths);     
        };

        return exports;
    });