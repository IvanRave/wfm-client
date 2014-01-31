/** @module */
define(['knockout',
    'viewmodels/map-tool',
    'viewmodels/well-marker-of-map-of-wield'],
    function (ko,
        VwmMapTool,
        VwmWellMarker) {
        'use strict';

        var usualMapTools = [
                {
                    id: 'hand',
                    name: '{{capitalizeFirst lang.mapToolHand}}',
                    icon: 'glyphicon glyphicon-hand-up',
                    isPublicTool: true
                },
                ////{
                ////    id: 'ruler',
                ////    name: '{{capitalizeFirst lang.mapToolRuler}}',
                ////    icon: 'glyphicon glyphicon-resize-full',
                ////    isPublicTool: true
                ////},
                {
                    id: 'marker',
                    name: '{{capitalizeFirst lang.mapToolWellMarker}}',
                    icon: 'glyphicon glyphicon-map-marker',
                    isPublicTool: false
                }
                ////{
                ////    id: 'area',
                ////    name: '{{capitalizeFirst lang.mapToolArea}}',
                ////    icon: 'glyphicon glyphicon-retweet',
                ////    isPublicTool: false
                ////},
                ////{
                ////    id: 'scale',
                ////    name: '{{capitalizeFirst lang.mapToolScale}}',
                ////    icon: 'glyphicon glyphicon-screenshot',
                ////    isPublicTool: false
                ////}
        ];

        /** Calculate svg image size using real size and svg block size */
        function calcSvgImgSize(realImgSize, svgBlockSize) {
            var svgImgSize = {};
            // If height is bigger side, then calculate width
            // if height = 600svg (400px) then width = Xsvg (300px)
            // X = (300px * 600svg) / 400px
            // else if width = 1200svg (300px) then height = Ysvg (400px)
            // Y = (400px * 1200svg) / 300px
            if ((realImgSize.height * svgBlockSize.ratio) > realImgSize.width) {
                svgImgSize.height = svgBlockSize.height;
                svgImgSize.width = (realImgSize.width * svgBlockSize.height) / realImgSize.height;
            }
            else {
                svgImgSize.width = svgBlockSize.width;
                svgImgSize.height = (realImgSize.height * svgBlockSize.width) / realImgSize.width;
            }

            return svgImgSize;
        }

        function getCoefVgToPx(imgSizeInPx, imgSizeInVg) {
            return {
                x: imgSizeInVg.width / imgSizeInPx.width,
                y: imgSizeInVg.height / imgSizeInPx.height
            };
        }

        /**
        * View for well field map: contains selected objects, zoom, translate options
        * @constructor
        */
        var exports = function (mdlMapOfWield, koVidOfSlcVwmMapOfWield) {
            /** Alternative for this */
            var ths = this;

            this.mdlMapOfWield = mdlMapOfWield;

            /** View id === model id. CAUTION: few views from one model
            * @type {number}
            */
            this.vid = mdlMapOfWield.id;

            /**
            * Name link to model: need for options list
            * @type {string}
            */
            this.name = mdlMapOfWield.name;

            /**
            * Whether view is selected
            * @type {boolean}
            */
            this.isSlcVwmMapOfWield = ko.computed({
                read: function () {
                    return ths.vid === ko.unwrap(koVidOfSlcVwmMapOfWield);
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

            /**
            * Size of full svg block (viewbox), in vg
            */
            this.svgBlockSize = {
                width: 1200,
                height: 600,
                ratio: 2
            };

            this.mapWrap = {
                ratio: 1 / 2,
                width: ko.observable()
            };

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
            this.idOfSlcVwmMapTool = ko.observable();

            /**
            * Selected tool: wellMarker, area, ruler, set scale, etc.
            * @type {string}
            */
            this.slcMapTool = ko.computed({
                read: function () {
                    var tmpMapTools = ko.unwrap(ths.mapTools);
                    if (tmpMapTools.length > 0) {
                        var tmpId = ko.unwrap(ths.idOfSlcVwmMapTool);

                        if (tmpId) {
                            return tmpMapTools.filter(function (elem) {
                                return elem.id === tmpId;
                            })[0];
                        }
                        else {
                            // If no id - return first tool: by default: hand
                            // and set to id
                            ths.idOfSlcVwmMapTool(tmpMapTools[0].id);
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
            this.mapTools = ko.computed({
                read: function () {
                    return usualMapTools.map(function (elem) {
                        return new VwmMapTool(elem, ths.idOfSlcVwmMapTool);
                    });
                },
                deferEvaluation: true
            });

            /** Select map tool */
            this.selectMapTool = function (mapToolToSelect) {
                // Select id -> system automatically sets tool as selected
                ths.idOfSlcVwmMapTool(mapToolToSelect.id);
            };

            /**
            * List of viewmodels of well markers
            * @type {Array.<module:viewmodels/well-marker-of-map-of-wield>}
            */
            this.listVwmWellMarker = ko.computed({
                read: function () {
                    return ko.unwrap(mdlMapOfWield.wellMarkers).map(function (elem) {
                        return new VwmWellMarker(elem, ths.slcVwmWellMarker);
                    });
                },
                deferEvaluation: true
            });

            /**
            * Selected well marker
            * @type {<module:models/well-marker-of-map-of-wield>}
            */
            this.slcVwmWellMarker = ko.observable();

            /**
            * Image (map) size in pixels
            * @type {Object}
            */
            this.imgSizePx = ko.computed({
                read: function () {
                    var tmpFileSpec = ths.mdlMapOfWield.fileSpec;

                    return {
                        width: ko.unwrap(tmpFileSpec.imgWidth),
                        height: ko.unwrap(tmpFileSpec.imgHeight)
                    };
                },
                deferEvaluation: true
            });

            /////**
            ////* Amount pixels in vg (svg viewbox units)
            ////* @type {number}
            ////*/
            ////this.coefVgToPx = ko.computed({
            ////    read: function () {
            ////        var tmpImgSizePx = ko.unwrap(ths.imgSizePx);
            ////        var tmpSvgSizeVg = ths.svgBlockSize;
            ////        var tmpImgSizeVg = calcSvgImgSize(tmpImgSizePx, tmpSvgSizeVg);
            ////        return getCoefVgToPx(tmpImgSizePx, tmpImgSizeVg);
            ////    },
            ////    deferEvaluation: true
            ////});

            /** Select well marker */
            this.selectVwmWellMarker = function (vwmWellMarkerToSelect) {
                ths.slcVwmWellMarker(vwmWellMarkerToSelect);
                console.log('scale');
                // Set to the center and scale to 10 * 8 (marker radius) = 80units
                // Center of svg block
                var svgCenterCoords = [ths.svgBlockSize.width / 2, ths.svgBlockSize.height / 2];
                // Svg marker coords = Real marker coords (in pixels) -> Real marker coords (in svg units) + Image margin (in svg units)
                var wellMarkerCoordsInPx = ko.unwrap(vwmWellMarkerToSelect.mdlWellMarker.coords);
                // TODO: change null values
                var tmpImgSizePx = ko.unwrap(ths.imgSizePx);
                var tmpSvgSizeVg = ths.svgBlockSize;
                var tmpImgSizeVg = calcSvgImgSize(tmpImgSizePx, tmpSvgSizeVg);
                var coefVgToPx = getCoefVgToPx(tmpImgSizePx, tmpImgSizeVg);

                var imgStartPos = {
                    x: (ths.svgBlockSize.width - tmpImgSizeVg.width) / 2,
                    y: (ths.svgBlockSize.height - tmpImgSizeVg.height) / 2
                };

                var wellMarkerCoordsInVg = [wellMarkerCoordsInPx[0] * coefVgToPx.x + imgStartPos.x, wellMarkerCoordsInPx[1] * coefVgToPx.y + imgStartPos.y];

                var transformCoords = [svgCenterCoords[0] - wellMarkerCoordsInVg[0], svgCenterCoords[1] - wellMarkerCoordsInVg[1]];

                ths.transformAttr({
                    scale: 1,
                    translate: transformCoords
                });
            };

            /**
            * Well marker to add
            *    Set point on the map, show adding panel right of the map
            * @type {Object}
            */
            this.wellMarkerDataToAdd = {
                coords: ko.observable(),
                idOfWell: ko.observable()
            };

            /** Add well marker: different methods for different views */
            this.addWellMarkerToMap = function () {
                mdlMapOfWield.postWellMarker(ko.unwrap(ths.wellMarkerDataToAdd.idOfWell), ko.unwrap(ths.wellMarkerDataToAdd.coords));

                // Clear selection: if post is unsuccessful - then only show error
                ths.cancelAddingWellMarker();
            };

            /**
            * Cancel adding: clear object to adding
            */
            this.cancelAddingWellMarker = function () {
                ths.wellMarkerDataToAdd.coords(null);
                ths.wellMarkerDataToAdd.idOfWell(null);
            };

            /** Remove analog for model */
            this.removeVwmWellMarker = function (vwmWellMarkerToRemove) {
                if (confirm('{{capitalizeFirst lang.confirmToDelete}}?')) {
                    mdlMapOfWield.removeWellMarker(vwmWellMarkerToRemove.mdlWellMarker);
                }
            };

            /**
            * Zoom and translate for svg map: can be set from server or by user click or by mouse scroll. By default: 1
            * @type {number}
            */
            this.transformAttr = ko.observable({
                scale: 1,
                translate: [0, 0]
            });
        };

        return exports;
    });