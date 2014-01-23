/** @module */
define(['knockout', 'models/map-tool'], function (ko, MapTool) {
    'use strict';

    /** Import map tools */
    function importMapTools(data, koIdOfSlcMapTool) {
        return (data || []).map(function (item) {
            return new MapTool(item, koIdOfSlcMapTool);
        });
    }

    /**
    * View for well field map: contains selected objects, zoom, translate options
    * @constructor
    */
    var exports = function (mdlMapOfWield) {
        /** Alternative for this */
        var ths = this;

        this.mdlMapOfWield = mdlMapOfWield;

        /** Filtered and sorted well markers */
        this.handledWellMarkers = ko.computed({
            read: function () {
                return ko.unwrap(mdlMapOfWield.wellMarkers);
            },
            deferEvaluation: true
        });

        /** Filtered and sorted areas */
        this.handledAreas = ko.computed({
            read: function () {
                return ko.unwrap(mdlMapOfWield.areas);
            },
            deferEvaluation: true
        });

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

        /**
        * Id of selected tool
        * @type {string}
        */
        this.idOfSlcMapTool = ko.observable();

        /**
        * Selected tool: wellMarker, area, ruler, set scale, etc.
        * @type {string}
        */
        this.slcMapTool = ko.computed({
            read: function () {
                var tmpMapTools = ko.unwrap(ths.mapTools);
                if (tmpMapTools.length > 0) {
                    var tmpId = ko.unwrap(ths.idOfSlcMapTool);

                    if (tmpId) {
                        return tmpMapTools.filter(function (elem) {
                            return elem.id === tmpId;
                        })[0];
                    }
                    else {
                        // If no id - return first tool: by default: hand
                        // and set to id
                        ths.idOfSlcMapTool(tmpMapTools[0].id);
                        return tmpMapTools[0];
                    }
                }
            },
            deferEvaluation: true
        });

        /**
        * Map tools
        * @type {Array.<module:models/map-tool>}
        */
        this.mapTools = importMapTools([
            {
                id: 'hand',
                name: '{{capitalizeFirst lang.mapToolHand}}',
                icon: 'glyphicon glyphicon-hand-up'
            },
            {
                id: 'marker',
                name: '{{capitalizeFirst lang.mapToolWellMarker}}',
                icon: 'glyphicon glyphicon-map-marker'
            },
            {
                id: 'ruler',
                name: '{{capitalizeFirst lang.mapToolRuler}}',
                icon: 'glyphicon glyphicon-resize-full'
            },
            {
                id: 'area',
                name: '{{capitalizeFirst lang.mapToolArea}}',
                icon: 'glyphicon glyphicon-retweet'
            },
            {
                id: 'scale',
                name: '{{capitalizeFirst lang.mapToolScale}}',
                icon: 'glyphicon glyphicon-screenshot'
            }
        ], ths.slcMapTool);

        /** Select map tool */
        this.selectMapTool = function (mapToolToSelect) {
            // Select id -> system automatically sets tool as selected
            ths.idOfSlcMapTool(mapToolToSelect.id);
        };

        /**
        * Selected well marker
        * @type {<module:models/well-marker-of-map-of-wield>}
        */
        this.slcWellMarker = ko.observable();

        /** Select well marker */
        this.selectWellMarker = function (wellMarkerToSelect) {
            ths.slcWellMarker(wellMarkerToSelect);
        };

        /**
        * Well for adding to this map: selected through select box: different for different views
        * @type {<module:models/well>}
        */
        this.wellToAddToMap = ko.observable();

        /** Add well marker: different methods for different views */
        this.addWellMarkerToMap = function () {
            var tmpWellToAddToMap = ko.unwrap(ths.wellToAddToMap);
            if (!tmpWellToAddToMap) { return; }

            mdlMapOfWield.postWellMarker(tmpWellToAddToMap.id);

            // Clear selection: if post is unsuccessful - then only show error
            ths.wellToAddToMap(null);
        };

        /** Remove analog for model */
        this.removeWellMarker = function (wellMarkerToRemove) {
            mdlMapOfWield.removeWellMarker(wellMarkerToRemove);
        };

        /**
        * Zoom for svg map: can be set from server or by user click or by mouse scroll. By default: 1
        * @type {number}
        */
        this.transformScale = ko.observable();
    };

    return exports;
});