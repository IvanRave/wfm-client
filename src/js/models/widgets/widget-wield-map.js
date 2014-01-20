/** @module */
define(['knockout', 'models/view-models/maps-of-wield-vwm'], function (ko, MapsOfWieldVwm) {
    'use strict';

    /** Widget view model for map of well field */
    var exports = function (opts, koMapsOfWield) {
        opts = opts || {};

        var ths = this;

        /** Load all maps and select need, using option: mapId */
        this.widgetVwm = new MapsOfWieldVwm(koMapsOfWield, opts);

        /** Whether name of map is visible */
        this.isVisName = ko.observable(opts['IsVisName']);

        /** Whether map is visible */
        this.isVisImg = ko.observable(opts['IsVisImg']);

        /** Convert to plain JSON to send to the server as widget settings */
        this.toPlainOpts = function () {
            return {
                'IdOfSlcMapOfWield': ko.unwrap(ths.widgetVwm.idOfSlcMapOfWield),
                'IsVisName': ko.unwrap(ths.isVisName),
                'IsVisImg': ko.unwrap(ths.isVisImg)
            };
        };
    };

    return exports;
});