/** @module */
define(['knockout',
    'viewmodels/wroup',
    'viewmodels/bases/stage-child-base',
    'viewmodels/bases/stage-base'],
    function (ko, VwmWroup, VwmStageChildBase, VwmStageBase) {
        'use strict';

        /**
        * View for well field maps: contains filtered maps and selected map
        * @constructor
        */
        var exports = function (mdlWield, koSlcVwmWield, defaultSlcData) {
            ////* @param {object} opts - options for this view, like id of selected map, sort direction, filters etc.
            ////* @param {Array.<module:models/map-of-wield>} koMapsOfWield - models for maps (knockout wrapped)

            /** Alternative for this */
            var ths = this;

            this.mdlStage = mdlWield;

            this.unq = mdlWield.id;

            /**
            * List of views of well wroups
            * @type {Array.<module:viewmodels/wroup>}
            */
            this.listOfVwmChild = ko.computed({
                read: function () {
                    return ko.unwrap(mdlWield.wroups).map(function (elem) {
                        return new VwmWroup(elem, ths.slcVwmChild, defaultSlcData);
                    });
                },
                deferEvaluation: true
            });

            VwmStageBase.call(this, koSlcVwmWield, defaultSlcData.wieldSectionId);

            VwmStageChildBase.call(this, defaultSlcData.wroupId);

            /** Sorted and filtered maps */
            this.handledMapsOfWield = ko.computed({
                read: function () {
                    var allMaps = ko.unwrap(mdlWield.WellFieldMaps);
                    return allMaps || [];
                },
                deferEvaluation: true
            });

            /** Id of selected map for this view: different views can be with different selections */
            this.idOfSlcMapOfWield = ko.observable();

            /** Selected map */
            this.slcMapOfWield = ko.computed({
                read: function () {
                    var allMaps = ko.unwrap(ths.handledMapsOfWield);
                    var slcId = ko.unwrap(ths.idOfSlcMapOfWield);
                    var slcMap = allMaps.filter(function (elem) {
                        return elem.id === slcId;
                    })[0];

                    if (!slcMap) {
                        // Select by default first element if no ID for all views
                        slcMap = allMaps[0];
                    }

                    if (slcMap) {
                        return slcMap;
                    }
                },
                deferEvaluation: true
            });

            /** Select map */
            this.selectMapOfWield = function (mapOfWieldToSelect) {
                // Select id
                ths.idOfSlcMapOfWield(mapOfWieldToSelect.id);
                // Automatically will be selected map model
            };
        };

        return exports;
    });