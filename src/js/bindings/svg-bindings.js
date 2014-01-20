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

    /** Svg map */
    ko.bindingHandlers.svgMap = {
        init: function (element, valueAccessor) {
            var accessor = valueAccessor();
            var imgUrl = ko.unwrap(accessor.imgUrl);

            // Image size
            var realImgSize = {
                width: ko.unwrap(accessor.imgWidth), // example: 300px
                height: ko.unwrap(accessor.imgHeight) // example: 400px
            };

            // Block (svg) size without margins
            // TODO: get from view-model
            var svgBlockSize = {
                width: 1200,
                height: 600
            };

            // Calculate image size in svg viewbox
            var svgImgSize = {};

            // If height is bigger side, then calculate width
            // if height = 600svg (400px) then width = Xsvg (300px)
            // X = (300px * 600svg) / 400px
            // else if width = 1200svg (300px) then height = Ysvg (400px)
            // Y = (400px * 1200svg) / 300px
            if (realImgSize.height > realImgSize.width) {
                svgImgSize.height = svgBlockSize.height;
                svgImgSize.width = (realImgSize.width * svgBlockSize.height) / realImgSize.height;
            }
            else {
                svgImgSize.width = svgBlockSize.width;
                svgImgSize.height = (realImgSize.height * svgBlockSize.width) / realImgSize.width;
            }

            var imgStartPos = {
                x: (svgBlockSize.width - svgImgSize.width) / 2,
                y: (svgBlockSize.height - svgImgSize.height) / 2
            };

            var d3GroupWrap = d3.select(element);

            var d3Group = d3GroupWrap.select('g');

            d3Group.append('image')
                .attr('xlink:href', imgUrl)
                .attr('height', svgImgSize.height)
                .attr('width', svgImgSize.width)
                .attr('x', imgStartPos.x)
                .attr('y', imgStartPos.y);

            var d3Image = d3Group.select('image');

            d3Image.on('click', function () {
                // this = d3Image
                var coords = d3.mouse(this);

                // Calculate coords on map image in pixels
                // realX / svgX = realWidth / svgWidth
                var realMarkerPos = {
                    x: (coords[0] - imgStartPos.x) * (realImgSize.width / svgImgSize.width),
                    y: (coords[1] - imgStartPos.y) * (realImgSize.height / svgImgSize.height)
                };

                // Send to the server in PUT method (change well marker data)
                console.log(realMarkerPos);

                d3Group.append('circle')
                    .attr('cx', coords[0])
                    .attr('cy', coords[1])
                    .attr('r', 8)
                    .on('click', function () {
                        // Show info about well in this point
                        console.log('circle hoora', coords);
                    });
            });

            var x = d3.scale.linear().range([imgStartPos.x, imgStartPos.x + svgImgSize.width]);
            var y = d3.scale.linear().range([imgStartPos.y, imgStartPos.y + svgImgSize.height]);

            function zoomed() {
                d3Group.attr('transform', 'translate(' + d3.event.translate.join(',') + ') scale(' + d3.event.scale + ')');
            }

            var zoom = d3.behavior.zoom()
                .x(x)
                .y(y)
                .scaleExtent([0.5, 15])
                .on('zoom', zoomed);

            d3GroupWrap.call(zoom);
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