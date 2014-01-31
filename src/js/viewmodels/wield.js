/** @module */
define(['knockout',
    'viewmodels/wroup',
    'viewmodels/map-of-wield',
    'viewmodels/bases/stage-child-base',
    'viewmodels/bases/stage-base'],
    function (ko,
        VwmWroup,
        VwmMapOfWield,
        VwmStageChildBase,
        VwmStageBase) {
        'use strict';

        /**
        * View for well field maps: contains filtered maps and selected map
        * @constructor
        */
        var exports = function (mdlWield, koUnqOfSlcVwmWield, defaultSlcData, fmgrLink) {
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
                        return new VwmWroup(elem, ths.unqOfSlcVwmChild, defaultSlcData, ths.fmgr);
                    });
                },
                deferEvaluation: true
            });

            // Has a children (wroups)
            VwmStageChildBase.call(this, defaultSlcData.wroupId);
            // Has sections and widgets
            VwmStageBase.call(this, defaultSlcData.wieldSectionId, koUnqOfSlcVwmWield);

            /** List of views of maps of this well field view*/
            this.listOfVwmMapOfWield = ko.computed({
                read: function () {
                    return ko.unwrap(mdlWield.WellFieldMaps).map(function (elem) {
                        return new VwmMapOfWield(elem, ths.slcVwmMapOfWield);
                    });
                },
                deferEvaluation: true
            });

            /** Sorted list */
            this.sortedListOfVwmMapOfWield = ko.computed({
                read: function () {
                    var tmpMaps = ko.unwrap(ths.listOfVwmMapOfWield);
                    // Sort by name
                    return tmpMaps.sort(function (a, b) {
                        return ko.unwrap(a.mdlMapOfWield.name) > ko.unwrap(b.mdlMapOfWield.name);
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
                            ths.vidOfSlcVwmMapOfWield(tmpFirstVwm.vid);
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

            /**
            * Create map from file
            */
            this.createMapFromFile = function () {
                ths.unzOfSlcVwmSectionFmg(ths.mdlStage.stageKey + '-map');

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