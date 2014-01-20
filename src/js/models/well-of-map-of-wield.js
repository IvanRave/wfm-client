/** @module */
define(['knockout', 'services/datacontext'], function (ko, datacontext) {

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
        * Pixels from top of map image
        * @type {number}
        */
        this.longitude = ko.observable(data.Longitude);

        /**
        * Pixels from left of map image
        * @type {number}
        */
        this.latitude = ko.observable(data.Latitude);

        this.WellFieldMapId = data.WellFieldMapId;
        // change well - remove and create object
        this.WellId = data.WellId;

        var tileLength = 255;
        var mapCoordScale = Math.max(ths.getWellFieldMap().Width, ths.getWellFieldMap().Height) / tileLength;

        this.coordX = ko.computed(function () {
            return ths.latitude() * mapCoordScale;
        });

        this.coordY = ko.computed(function () {
            return (tileLength - ths.longitude()) * mapCoordScale;
        });

        ////var tileLength = 255;
        ////var coordX = 0, coordY = 0;
        ////// if width > height
        ////var mapCoordScale = Math.max(ths.Width, ths.Height) / tileLength;

        ////coordX = latitude * mapCoordScale;
        ////coordY = (tileLength - longitude) * mapCoordScale;

        this.getWell = function () {
            var wellFieldItem = ths.getWellFieldMap().getWellField();
            for (var WellGroupKey = 0; WellGroupKey < wellFieldItem.wroups().length; WellGroupKey++) {
                for (var WellKey = 0; WellKey < wellFieldItem.wroups()[WellGroupKey].Wells().length; WellKey++) {
                    if (wellFieldItem.wroups()[WellGroupKey].Wells()[WellKey].Id === ths.WellId) {
                        return wellFieldItem.wroups()[WellGroupKey].Wells()[WellKey];
                    }
                }
            }

            return null;
        };

        this.deleteWellInWellFieldMap = function () {
            // TODO: are you sure dialog
            datacontext.deleteWellInWellFieldMap({ 'well_id': ths.WellId, 'wellfieldmap_id': ths.WellFieldMapId }).done(function () {
                // remove from map
                // GOTO: create parent in header; delete from parent array
                ths.getWellFieldMap().WellInWellFieldMaps.remove(ths);
            });
        };

        this.toPlainJson = function () { return ko.toJS(ths); };
    };


    return exports;
});