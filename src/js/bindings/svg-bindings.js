/** @module */
define(['jquery', 'knockout', 'd3'], function ($, ko, d3) {
    'use strict';

    ko.bindingHandlers.svgZoomGraph = {
        update: function (element, valueAccessor) {
            var dataSet = ko.unwrap(valueAccessor().filteredByDateProductionDataSet);
            if (dataSet.length === 0) { return; }

            var graph = {
                axis: ko.unwrap(valueAccessor().prfGraphAxis),
                zoom: ko.unwrap(valueAccessor().prfGraphZoom),
                viewBox: ko.unwrap(valueAccessor().prfGraphViewBox),
                svgPath: ko.unwrap(valueAccessor().productionDataSetSvgPath)
            };

            // Zoom coefficient for plus/minus buttons
            var scaleCoef = 1.1;
            var diffX = (graph.viewBox.width / 2) * (scaleCoef - 1),
                diffY = (graph.viewBox.height / 2) * (scaleCoef - 1);

            var graphWrap = d3.select(element);

            function redrawGraph() {
                // Redraw each curve (JSON obj)
                $.each(graph.svgPath, function (elemKey, elemVal) {
                    graphWrap.select('.svg-prf-graph-g').select('#grp-' + elemKey).attr('d', elemVal(dataSet));
                });

                // Redraw x axis
                graphWrap.select('.axis.x').call(graph.axis.x);

                // Redraw y axis
                graphWrap.select('.axis.y').call(graph.axis.y);
            }

            // When zooming redraw graph
            graph.zoom.on('zoom', redrawGraph);

            // Apply zoom to whole graph (axis + lines)
            graphWrap.select('.graph-zoom-rect').call(graph.zoom);

            graphWrap.select('.zoom-in').on('click', function () {
                graph.zoom.scale(graph.zoom.scale() * scaleCoef);

                var tmpTr = graph.zoom.translate();
                tmpTr[0] -= diffX;
                tmpTr[1] -= diffY;
                graph.zoom.translate(tmpTr);

                redrawGraph();

                // Previous graph state - before click
                ////var prevGraph = {
                ////    // by default = 1
                ////    scale: graph.zoom.scale(),
                ////    // by default = [0,0]
                ////    translate: graph.zoom.translate()
                ////};

                ////// Previous width of graph = Initial width * previous zoom
                ////prevGraph.width = graph.viewBox.width / prevGraph.scale;
                ////prevGraph.height = graph.viewBox.height / prevGraph.scale;

                ////// 1 -> 2 -> 4 -> 8 -> 16
                ////// Current graph state - after click
                ////var curGraph = {
                ////    scale: prevGraph.scale + scaleCoef,
                ////    translate: []
                ////};

                ////graph.zoom.scale(curGraph.scale);

                ////curGraph.width = prevGraph.width / curGraph.scale;
                ////curGraph.height = prevGraph.height / curGraph.scale;

                ////curGraph.translate[0] = prevGraph.translate[0] - ((prevGraph.width - curGraph.width) / 2);
                ////curGraph.translate[1] = prevGraph.translate[1] - ((prevGraph.height - curGraph.height) / 2);

                ////graph.zoom.translate(curGraph.translate);
                //////    // dx = (x * cf - x)/2

                //////    tmpTranslate[0] -= (prfGraphViewBox.width * tmpZoom - prfGraphViewBox.width) / 2;
                //////    tmpTranslate[1] -= (prfGraphViewBox.height * tmpZoom - prfGraphViewBox.height) / 2;
                //////    prfGraphZoom.translate(tmpTranslate);

            });

            graphWrap.select('.zoom-out').on('click', function () {
                ////if (tmpSc > 1) {
                graph.zoom.scale(graph.zoom.scale() / scaleCoef);

                var tmpTr = graph.zoom.translate();
                tmpTr[0] += diffX;
                tmpTr[1] += diffY;
                graph.zoom.translate(tmpTr);

                redrawGraph();
                ////}
                ////var tmpZoom = prfGraphZoom.scale();
                ////// 1 -> 1/2 -> 1/4 -> 1/8 -> 1/16
                ////if ($.isNumeric(tmpZoom)) {
                ////    tmpZoom = tmpZoom / zoomCoef;
                ////    prfGraphZoom.scale(tmpZoom);

                ////    var tmpTranslate = prfGraphZoom.translate();
                ////    tmpTranslate[0] += (1110 * (zoomCoef - 1)) / 2;
                ////    tmpTranslate[1] += (370 * (zoomCoef - 1)) / 2;

                ////    prfGraphZoom.translate(tmpTranslate);

                ////    redrawGraph();
                ////    console.log(tmpZoom);
                ////}
            });

            // Redraw graph once like initial zoom event
            redrawGraph();
        }
    };

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

    /** Drag and drop for circles */
    function getDragSvgCircle(wellMarkerItem, coefVgToPx) {
        var imgBounds = {};
        // TODO: get radius from view
        var markerRadius = 8;
        var dragSvgCircle = d3.behavior.drag()
        ////.origin()
        .on('dragstart', function () {
            // silence other listeners
            d3.event.sourceEvent.stopPropagation();

            var d3BoundImage = d3.select(this).select(function () { return this.parentNode; }).select('image');

            var boundCoords = {
                left: +d3BoundImage.attr('x'),
                right: +d3BoundImage.attr('x') + (+d3BoundImage.attr('width')),
                top: +d3BoundImage.attr('y'),
                bottom: +d3BoundImage.attr('y') + (+d3BoundImage.attr('height'))
            };

            imgBounds = boundCoords;
        })
        .on('drag', function () {
            // Change circle coords
            ////console.log('event', d3.event.x, d3.event.y);
            ////console.log('mouse', d3.mouse(this));
            var xNew = Math.max(Math.min(d3.event.x, imgBounds.right - markerRadius), imgBounds.left + markerRadius),
                yNew = Math.max(Math.min(d3.event.y, imgBounds.bottom - markerRadius), imgBounds.top + markerRadius);

            d3.select(this)
                .attr('cx', xNew)
                .attr('cy', yNew);
        })
        .on('dragend', function () {
            var tmpElem = d3.select(this);
            wellMarkerItem.coords([(+tmpElem.attr('cx') - imgBounds.left) / coefVgToPx.x,
                (+tmpElem.attr('cy') - imgBounds.top) / coefVgToPx.y]);

            ////console.log(tmpCoords);
            ////console.log(wellMarkerItem);
        });

        return dragSvgCircle;
    }

    function getCoefVgToPx(imgSizeInPx, imgSizeInVg) {
        return {
            x: imgSizeInVg.width / imgSizeInPx.width,
            y: imgSizeInVg.height / imgSizeInPx.height
        };
    }

    /** Svg map */
    ko.bindingHandlers.svgMap = {
        init: function (element, valueAccessor) {
            var accessor = valueAccessor();

            // Only non-observable objects or initial states of objects
            // Image url doesn't change
            var imgUrl = ko.unwrap(accessor.imgUrl);
            var koTransformAttr = accessor.transformAttr;

            // Image size doesn't change
            var realImgSize = {
                width: ko.unwrap(accessor.imgWidth), // example: 300px
                height: ko.unwrap(accessor.imgHeight) // example: 400px
            };

            // Block (svg) size without margins (doesn't change)
            var svgBlockSize = {
                width: accessor.svgBlockWidth,
                height: accessor.svgBlockHeight,
                ratio: accessor.svgBlockWidth / accessor.svgBlockHeight
            };

            // Calculate image size in svg viewbox
            var svgImgSize = calcSvgImgSize(realImgSize, svgBlockSize);

            var imgStartPos = {
                x: (svgBlockSize.width - svgImgSize.width) / 2,
                y: (svgBlockSize.height - svgImgSize.height) / 2
            };

            var d3GroupWrap = d3.select(element);

            var d3Group = d3GroupWrap.select('g');

            // Append image with map (only once on init event)
            d3Group.append('image')
                .attr('xlink:href', imgUrl)
                .attr('height', svgImgSize.height)
                .attr('width', svgImgSize.width)
                .attr('x', imgStartPos.x)
                .attr('y', imgStartPos.y);

            // Add zoom for all elements (group) only once on init event
            var x = d3.scale.linear().range([imgStartPos.x, imgStartPos.x + svgImgSize.width]);
            var y = d3.scale.linear().range([imgStartPos.y, imgStartPos.y + svgImgSize.height]);

            function zoomed() {
                koTransformAttr({
                    scale: d3.event.scale,
                    translate: d3.event.translate
                });

                d3Group.attr('transform', 'translate(' + d3.event.translate.join(',') + ') scale(' + d3.event.scale + ')');
            }

            var zoom = d3.behavior.zoom()
                .x(x)
                .y(y)
                .scaleExtent([0.5, 15])
                .on('zoom', zoomed);

            // Default scale and translate
            var tmpTransformAttr = ko.unwrap(koTransformAttr);
            zoom.scale(tmpTransformAttr.scale).translate(tmpTransformAttr.translate);
            d3Group.attr('transform', 'translate(' + tmpTransformAttr.translate.join(',') + ') scale(' + tmpTransformAttr.scale + ')');

            d3GroupWrap.call(zoom);
        },
        update: function (element, valueAccessor) {
            // Working with observables values
            var accessor = valueAccessor();
            var idOfSlcMapTool = ko.unwrap(accessor.idOfSlcMapTool);
            var slcWellMarker = ko.unwrap(accessor.slcWellMarker);

            var wellMarkerDataToAdd = accessor.wellMarkerDataToAdd;

            // Image size
            var realImgSize = {
                width: ko.unwrap(accessor.imgWidth), // example: 300px
                height: ko.unwrap(accessor.imgHeight) // example: 400px
            };

            // Block (svg) size without margins
            var svgBlockSize = {
                width: accessor.svgBlockWidth,
                height: accessor.svgBlockHeight,
                ratio: accessor.svgBlockWidth / accessor.svgBlockHeight
            };

            // Calculate image size in svg viewbox
            var svgImgSize = calcSvgImgSize(realImgSize, svgBlockSize);

            var coefVgToPx = getCoefVgToPx(realImgSize, svgImgSize);

            console.log('coefVgToPx', coefVgToPx);

            var imgStartPos = {
                x: (svgBlockSize.width - svgImgSize.width) / 2,
                y: (svgBlockSize.height - svgImgSize.height) / 2
            };

            var wellMarkers = ko.unwrap(accessor.wellMarkers);
            var wellMarkerRadius = ko.unwrap(accessor.wellMarkerRadius);
            // Draw well markers
            var d3GroupWrap = d3.select(element);

            var d3Group = d3GroupWrap.select('g');

            var d3Image = d3Group.select('image');

            ////function addWellMarker(cx, cy) {
            ////    d3Group.append('circle')
            ////        .attr('cx', cx)
            ////        .attr('cy', cy)
            ////        .attr('r', wellMarkerRadius)
            ////        .on('click', function () {
            ////            // Show info about well in this point
            ////            if (d3.event.defaultPrevented) { return; }
            ////            console.log('circle hoora', cx, cy);
            ////        })
            ////        .call(getDragSvgCircle());


            ////}

            d3Image.on('click', function () {
                console.log(idOfSlcMapTool);
                if (idOfSlcMapTool !== 'marker') { console.log('no marker'); return; }
                // this = d3Image
                var coords = d3.mouse(this);

                // Add marker and show adding dialog right of the map

                // Calculate coords on map image in pixels
                // realX / svgX = realWidth / svgWidth
                var realMarkerPos = {
                    x: (coords[0] - imgStartPos.x) * (realImgSize.width / svgImgSize.width),
                    y: (coords[1] - imgStartPos.y) * (realImgSize.height / svgImgSize.height)
                };

                // Send to the server in PUT method (change well marker data)
                console.log('realMarkerPos', realMarkerPos);
                wellMarkerDataToAdd.coords([realMarkerPos.x, realMarkerPos.y]);
                //addWellMarker(realMarkerPos.x, realMarkerPos.y);
            });

            // Redraw all well markers: user can remove/add/change coords or any actions with markers outside of svg block
            // Clear all values
            d3Group.selectAll('circle').remove();

            function drawWellMarker(wellMarkerItem, fillColor) {
                // Convert empty coords
                var wellMarkerCoordsInPx = ko.unwrap(wellMarkerItem.coords);

                console.log('wellMarkerCoordsInPx', wellMarkerCoordsInPx);

                if (!wellMarkerCoordsInPx[0] || !wellMarkerCoordsInPx[1]) {
                    // set to the center of image
                    wellMarkerCoordsInPx = [realImgSize.width / 2, realImgSize.height / 2];
                }

                /** In svg units (abbr: vg) */
                ////var wellMarkerCoordsInVg = convertCoordsPxToVg(wellMarkerCoordsInPx, realImgSize, svgBlockSize);
                //// F.E.: convert([300px, 300px], {width: 500px, height: 700px}, {width: 1200vg, height: 600vg, ratio: 2})
                ////addWellMarker
                var tmpCx = wellMarkerCoordsInPx[0] * coefVgToPx.x + imgStartPos.x;
                var tmpCy = wellMarkerCoordsInPx[1] * coefVgToPx.y + imgStartPos.y;
                d3Group.append('circle')
                    .attr('cx', tmpCx)
                    .attr('cy', tmpCy)
                    .attr('r', wellMarkerRadius)
                    .attr('fill', fillColor)
                    .attr('stroke', 'white')
                    .on('click', function () {
                        // Show info about well in this point
                        if (d3.event.defaultPrevented) { return; }
                        //console.log('circle hoora', cx, cy);
                    })
                    .call(getDragSvgCircle(wellMarkerItem, coefVgToPx));
            }

            // Add fresh values
            wellMarkers.forEach(function (elem) {
                drawWellMarker(elem, 'black');
            });

            if (ko.unwrap(wellMarkerDataToAdd.coords)) {
                console.log('wellmarkertoadd', wellMarkerDataToAdd);
                drawWellMarker(wellMarkerDataToAdd, 'green');
            }

            console.log('markers', wellMarkers);

            // Point and scale map to selected well marker
            if (slcWellMarker) {
                ////// Set to the center and scale to 10 * 8 (marker radius) = 80units
                ////// Center of svg block
                var svgCenterCoords = [svgBlockSize.width / 2, svgBlockSize.height / 2];
                ////// Svg marker coords = Real marker coords (in pixels) -> Real marker coords (in svg units) + Image margin (in svg units)
                var wellMarkerCoordsInPx = ko.unwrap(slcWellMarker.coords);
                // TODO: change null values

                var wellMarkerCoordsInVg = [wellMarkerCoordsInPx[0] * coefVgToPx.x + imgStartPos.x, wellMarkerCoordsInPx[1] * coefVgToPx.y + imgStartPos.y];

                var transformCoords = [svgCenterCoords[0] - wellMarkerCoordsInVg[0], svgCenterCoords[1] - wellMarkerCoordsInVg[1]];

                d3Group.attr('transform', 'translate(' + transformCoords.join(',') + ')');
                // scale(' + 1 + ')'
            }

            console.log('slcWell', slcWellMarker);
        }
    };

    /** svg (like perfomance graph or field map) */
    ko.bindingHandlers.svgResponsive = {
        init: function (element, valueAccessor) {
            var accessor = valueAccessor();

            function updateWidth() {
                accessor.koSvgWidth($(element).parent().width());
            }

            // When change window size - update svg size
            $(window).resize(updateWidth);

            // When toggle left menu - update svg size
            accessor.tmpIsVisibleMenu.subscribe(updateWidth);

            // Update initial
            updateWidth();
            // svg viewbox size need to init before creating of this element
        }
    };
});