/** @module */
define(['knockout', 'viewmodels/map-of-wield'], function (ko, VwmMapOfWield) {
    'use strict';

    /**
    * Base: widget view model for map of well field 
    * @constuctor
    */
    var exports = function (opts, mdlWield) {
        opts = opts || {};

        var ths = this;

        /**
        * Selected view map
        */
        this.slcVwmMapOfWield = ko.computed({
            read: function () {
                var tmpVid = ko.unwrap(ths.vidOfSlcVwmMapOfWield);
                if (tmpVid) {
                    return ko.unwrap(ths.listOfVwmMapOfWield).filter(function (elem) {
                        return elem.vid === tmpVid;
                    })[0];
                }
            },
            deferEvaluation: true
        });

        this.vidOfSlcVwmMapOfWield = ko.observable(opts['IdOfSlcMapOfWield']);

        /** List of maps for selection in widget settings */
        this.listOfVwmMapOfWield = ko.computed({
            read: function () {
                return ko.unwrap(mdlWield.WellFieldMaps).map(function (elem) {
                    return new VwmMapOfWield(elem, ths.slcVwmMapOfWield);
                });
            },
            deferEvaluation: true
        });

        /** Whether name of map is visible */
        this.isVisName = ko.observable(opts['IsVisName']);

        /** Whether map is visible */
        this.isVisImg = ko.observable(opts['IsVisImg']);

        /** Convert to plain JSON to send to the server as widget settings */
        this.toStringifyOpts = function () {
            return JSON.stringify({
                'IdOfSlcMapOfWield': ko.unwrap(ths.slcVwmMapOfWield).vid,
                'IsVisName': ko.unwrap(ths.isVisName),
                'IsVisImg': ko.unwrap(ths.isVisImg)
            });
        };
    };

    return exports;
});