/** @module */
define(['knockout', 'viewmodels/wroup'], function (ko, VwmWroup) {
    'use strict';

    /**
    * View for well field maps: contains filtered maps and selected map
    * @constructor
    */
    var exports = function (mdlWield) {
        ////* @param {object} opts - options for this view, like id of selected map, sort direction, filters etc.
        ////* @param {Array.<module:models/map-of-wield>} koMapsOfWield - models for maps (knockout wrapped)

        /** Alternative for this */
        var ths = this;

        this.mdlWield = mdlWield;

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

        this.vwmWroup = ko.computed({
            read: function () {
                var tmpWroup = ko.unwrap(ths.mdlWield.selectedWroup);
                if (tmpWroup) {
                    return new VwmWroup(tmpWroup);
                }
            },
            deferEvaluation: true
        });
    };

    return exports;
});