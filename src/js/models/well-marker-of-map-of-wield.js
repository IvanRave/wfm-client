/** @module */
define(['knockout', 'services/well-marker-of-map-of-wield'], function (ko, wellMarkerService) {

    /**
    * Model: well in map of well field
    * @constructor
    */
    var exports = function (data, wellFieldMap) {
        data = data || {};

        var ths = this;

        this.getWellFieldMap = function () {
            return wellFieldMap;
        };

        /**
        * Pixels from top-left of map image (1. longitude and 2.latitude)
        * @type {Array}
        */
        this.coords = ko.observable([data.CoordX, data.CoordY]);

        /////**
        ////* Whether marker is selected
        ////* @type {boolean}
        ////*/
        ////this.isSlc = ko.computed({
        ////    read: function () {
        ////        return ko.unwrap(ths.getWellFieldMap().slcWellMarker) === ths;
        ////    },
        ////    deferEvaluation: true
        ////});

        /////**
        ////* Pixels from top of map image (latitude)
        ////* @type {number}
        ////*/
        ////this.coordY = ko.observable(data.CoordY);

        /**
        * Id of map
        * @type {number}
        */
        this.idOfMapOfWield = data.IdOfMapOfWield;

        /**
        * Id of well
        * @type {number}
        */
        this.idOfWell = data.IdOfWell;

        ////var tileLength = 255;
        ////var mapCoordScale = Math.max(ths.getWellFieldMap().Width, ths.getWellFieldMap().Height) / tileLength;

        ////this.coordX = ko.computed(function () {
        ////    return ths.latitude() * mapCoordScale;
        ////});

        ////this.coordY = ko.computed(function () {
        ////    return (tileLength - ths.longitude()) * mapCoordScale;
        ////});

        ////var tileLength = 255;
        ////var coordX = 0, coordY = 0;
        ////// if width > height
        ////var mapCoordScale = Math.max(ths.Width, ths.Height) / tileLength;

        ////coordX = latitude * mapCoordScale;
        ////coordY = (tileLength - longitude) * mapCoordScale;

        /** Get well for this marker */
        this.getWell = function () {
            var wellFieldItem = ths.getWellFieldMap().getWellField();
            for (var WellGroupKey = 0; WellGroupKey < wellFieldItem.wroups().length; WellGroupKey++) {
                for (var WellKey = 0; WellKey < wellFieldItem.wroups()[WellGroupKey].Wells().length; WellKey++) {
                    if (wellFieldItem.wroups()[WellGroupKey].Wells()[WellKey].Id === ths.idOfWell) {
                        return wellFieldItem.wroups()[WellGroupKey].Wells()[WellKey];
                    }
                }
            }

            return null;
        };

        /**
        * Well name
        * @type {string}
        */
        this.wellName = ko.computed({
            read: function () {
                var tmpWell = ths.getWell();
                if (tmpWell) {
                    return ko.unwrap(tmpWell.Name);
                }
            },
            deferEvaluation: true
        });

        /** Save marker */
        this.save = function () {
            wellMarkerService.put(ths.idOfMapOfWield, ths.idOfWell, {
                'IdOfMapOfWield': ths.idOfMapOfWield,
                'IdOfWell': ths.idOfWell,
                'CoordX': ko.unwrap(ths.coords)[0],
                'CoordY': ko.unwrap(ths.coords)[1]
            });
        };

        /** Save coords when change */
        this.coords.subscribe(ths.save);

        ////this.toPlainJson = function () { return ko.toJS(ths); };
    };


    return exports;
});