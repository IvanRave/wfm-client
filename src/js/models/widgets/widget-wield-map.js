/** @module */
define(['knockout', 'viewmodels/wield', 'viewmodels/map-of-wield'], function (ko, VwmWield, VwmMapOfWield) {
    'use strict';

    /** Widget view model for map of well field */
    var exports = function (opts, koMdlWield) {
        opts = opts || {};

        var ths = this;

        /** Load all maps and select need, using option: mapId */
        this.vwmWield = ko.computed({
            read: function () {
                var tmpWield = ko.unwrap(koMdlWield);
                if (tmpWield) {
                    var tmpVwmWield = new VwmWield(tmpWield);
                    // Set id from server
                    tmpVwmWield.idOfSlcMapOfWield(opts['IdOfSlcMapOfWield']);
                    return tmpVwmWield;
                }
            },
            deferEvaluation: true
        }); 

        ////this.currentMapOfWield = ko.computed({
        ////    read: function () {
        ////        return ko.unwrap(ths.vwmMapsOfWield.slcMapOfWield);
        ////    },
        ////    deferEvaluation: true
        ////});

        this.vwmMapOfWield = ko.computed({
            read: function () {
                var tmpWield = ko.unwrap(ths.vwmWield);
                if (tmpWield) {
                    var tmpMapOfWield = ko.unwrap(tmpWield.slcMapOfWield);
                    if (tmpMapOfWield) {
                        return new VwmMapOfWield(tmpMapOfWield);
                    }
                }
            },
            deferEvaluation: true
        });

        /** Whether name of map is visible */
        this.isVisName = ko.observable(opts['IsVisName']);

        /** Whether map is visible */
        this.isVisImg = ko.observable(opts['IsVisImg']);

        /** Convert to plain JSON to send to the server as widget settings */
        this.toPlainOpts = function () {
            return {
                'IdOfSlcMapOfWield': ko.unwrap(ko.unwrap(ths.vwmWield).idOfSlcMapOfWield),
                'IsVisName': ko.unwrap(ths.isVisName),
                'IsVisImg': ko.unwrap(ths.isVisImg)
            };
        };
    };

    return exports;
});