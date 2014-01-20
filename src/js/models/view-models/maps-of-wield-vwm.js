/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /**
    * View for well field maps: contains filtered maps and selected map
    * @constructor
    * @param {Array.<module:models/map-of-wield>} koMapsOfWield - models for maps (knockout wrapped)
    * @param {object} opts - options for this view, like id of selected map, sort direction, filters etc.
    */
    var exports = function (koMapsOfWield, opts) {

        /** Alternative for this */
        var ths = this;

        /** Sorted and filtered maps */
        this.handledMapsOfWield = ko.computed({
            read: function () {
                var allMaps = ko.unwrap(koMapsOfWield);
                return allMaps;
            },
            deferEvaluation: true
        }); 

        /** Id of selected map for this view: different views can be with different selections */
        this.idOfSlcMapOfWield = ko.observable(opts['IdOfSlcMapOfWield']);

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
            deferEvalution: true
        });

        /** Select map */
        this.selectMapOfWield = function (mapOfWieldToSelect) {
            // Select id
            ths.idOfSlcMapOfWield(mapOfWieldToSelect.id);
            // Automatically will be selected map model
        };

        this.mapWrap = {};

        this.mapWrap.ratio = 1 / 2;

        this.mapWrap.width = ko.observable();

        // actual height of map wrap and y-axis
        this.mapWrap.height = ko.computed({
            read: function () {
                var tmpWidth = ko.unwrap(ths.mapWrap.width);
                if (tmpWidth) {
                    return tmpWidth * ths.mapWrap.ratio;
                }
            },
            deferEvaluation: true
        });
    };

    return exports;
});