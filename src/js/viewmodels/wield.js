/** @module */
define(['knockout',
    'viewmodels/wroup',
    'viewmodels/map-of-wield',
    'viewmodels/bases/stage-child-base',
    'viewmodels/bases/stage-base',
    'viewmodels/bases/stage-parent-base'],
    function (ko, VwmWroup, VwmMapOfWield, VwmStageChildBase, VwmStageBase, VwmStageParentBase) {
        'use strict';

        /**
        * View for well field maps: contains filtered maps and selected map
        * @constructor
        */
        var exports = function (mdlWield, koSlcVwmWield, defaultSlcData, fmgrLink) {
            ////* @param {object} opts - options for this view, like id of selected map, sort direction, filters etc.
            ////* @param {Array.<module:models/map-of-wield>} koMapsOfWield - models for maps (knockout wrapped)

            /** Alternative for this */
            var ths = this;

            this.mdlStage = mdlWield;

            this.unq = mdlWield.id;

            /** Link to company file manager */
            this.fmgr = fmgrLink;

            /**
            * List of views of well wroups
            * @type {Array.<module:viewmodels/wroup>}
            */
            this.listOfVwmChild = ko.computed({
                read: function () {
                    return ko.unwrap(mdlWield.wroups).map(function (elem) {
                        return new VwmWroup(elem, ths.slcVwmChild, defaultSlcData, ths.fmgr);
                    });
                },
                deferEvaluation: true
            });

            // Has a parent with few wields
            VwmStageParentBase.call(this, koSlcVwmWield);
            // Has a children (wroups)
            VwmStageChildBase.call(this, defaultSlcData.wroupId);
            // Has sections and widgets
            VwmStageBase.call(this, defaultSlcData.wieldSectionId);

            /** List of views of maps of this well field view*/
            this.listOfVwmMapOfWield = ko.computed({
                read: function () {
                    var tmpMaps = ko.unwrap(mdlWield.WellFieldMaps);

                    // Sort by name
                    tmpMaps = tmpMaps.sort(function (a, b) {
                        return ko.unwrap(a.name) > ko.unwrap(b.name);
                    });

                    console.log('updated list of views of maps');

                    return tmpMaps.map(function (elem) {
                        return new VwmMapOfWield(elem, ths.slcVwmMapOfWield);
                    });
                },
                deferEvaluation: true
            });

            /** Id of selected view of map of well field = id of map */
            this.vidOfSlcVwmMapOfWield = ko.observable();

            /** Selected view of map of well field */
            this.slcVwmMapOfWield = ko.computed({
                read: function () {
                    var tmpVid = ko.unwrap(ths.vidOfSlcVwmMapOfWield);
                    var tmpListOfVwm = ko.unwrap(ths.listOfVwmMapOfWield);
                    if (tmpVid) {
                        return tmpListOfVwm.filter(function (elem) {
                            return elem.vid === tmpVid;
                        })[0];
                        // CAUTION: few viewmodels from one field model
                    }
                    else {
                        var tmpFirstVwm = tmpListOfVwm[0];
                        if (tmpFirstVwm){
                            // TODO: try to set vid (if no)
                            ////ths.vidOfSlcVwmMapOfWield(tmpFirstVwm.vid);
                            ////console.log('asdfsdf');
                            // Select first map if no selected
                            return tmpFirstVwm;
                        }
                    }
                },
                deferEvaluation: true
            });

            /** Select view */
            this.selectVwmMapOfWield = function (vwmMapOfWieldToSelect) {
                ths.vidOfSlcVwmMapOfWield(vwmMapOfWieldToSelect.vid);
            };

            // TODO: remove from widgets and from here
            /////** Sorted and filtered maps */
            ////this.handledMapsOfWield = ko.computed({
            ////    read: function () {
            ////        return ko.unwrap(mdlWield.WellFieldMaps);
            ////    },
            ////    deferEvaluation: true
            ////});

            /////** Id of selected map for this view: different views can be with different selections */
            ////this.idOfSlcMapOfWield = ko.observable();

            /////** Selected map */
            ////this.slcMapOfWield = ko.computed({
            ////    read: function () {
            ////        var allMaps = ko.unwrap(ths.handledMapsOfWield);
            ////        var slcId = ko.unwrap(ths.idOfSlcMapOfWield);
            ////        var slcMap = allMaps.filter(function (elem) {
            ////            return elem.id === slcId;
            ////        })[0];

            ////        if (!slcMap) {
            ////            // Select by default first element if no ID for all views
            ////            slcMap = allMaps[0];
            ////        }

            ////        if (slcMap) {
            ////            return slcMap;
            ////        }
            ////    },
            ////    deferEvaluation: true
            ////});

            /**
            * Create map from file
            */
            this.createMapFromFile = function () {
                ths.unzOfSlcVwmSectionFmg(ths.mdlStage.stageKey + '-map');

                function mgrCallback() {
                    ths.fmgr.okError('');

                    var slcVwmSection = ko.unwrap(ths.slcVwmSectionFmg);

                    if (!slcVwmSection) { throw new Error('No selected section'); }

                    // Select file from file manager
                    var selectedFileSpecs = ko.unwrap(slcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
                        return ko.unwrap(elem.isSelected);
                    });

                    if (selectedFileSpecs.length !== 1) {
                        ths.fmgr.okError('need to select one file');
                        return;
                    }

                    ths.mdlStage.postMapOfWield(selectedFileSpecs[0].id, ko.unwrap(selectedFileSpecs[0].name), function () {
                        ths.fmgr.hide();
                    });
                }

                // Add to observable
                ths.fmgr.okCallback(mgrCallback);

                // Notification
                ths.fmgr.okDescription('Please select a file for a map');

                // Open file manager
                ths.fmgr.show();
            };
        };

        return exports;
    });