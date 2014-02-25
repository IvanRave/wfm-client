/** @module */
define(['jquery', 'knockout', 'd3'], function ($, ko, d3) {
	'use strict';

	/**
	 * Svg graph
	 *    used in the monitoring and perfomance sections (and may be in another)
	 * @constructor
	 */
	var exports = function () {
		/** Alternative for this */
		var ths = this;

		/**
		 * A standard ratio for the graph
		 * @type {number}
		 */
		this.ratio = 1 / 3;

		/**
		 * Real size of the graph, in pixels
		 * @type {object}
		 */
		this.sizePx = {
			width : ko.observable(),
			height : ko.computed({
				read : function () {
					var tmpWidth = ko.unwrap(ths.sizePx.width);
					if ($.isNumeric(tmpWidth)) {
						return tmpWidth * ths.ratio;
					}
				},
				deferEvaluation : true
			})
		};

		/**
		 * Viewbox size, with all margins, equals to the viewbox attribute of the svg element
		 * @type {object}
		 */
		this.vboxOutSize = {
			width : 1200,
			height : 400
		};

		/**
		 * Margins for axis and some space
		 * @type {object}
		 */
		this.vboxMargin = {
			top : 10,
			right : 30,
			bottom : 20,
			left : 60
		};

		/**
		 * Inner size of the graph in svg units
		 * @type {object}
		 */
		this.vboxSize = {
			width : ths.vboxOutSize.width - ths.vboxMargin.left - ths.vboxMargin.right,
			height : ths.vboxOutSize.height - ths.vboxMargin.top - ths.vboxMargin.bottom
		};

		/**
		 * An attribute for a group of the graph: like top-left padding
		 * @type {string}
		 */
		this.baseTransform = 'translate(' + ths.vboxMargin.left + ', ' + ths.vboxMargin.top + ')';

		/**
		 * An attribute for the X axis
		 * @type {string}
		 */
		this.axisXTransform = 'translate(0,' + ths.vboxSize.height + ')';

		/**
		 * Axis for the graph
		 * @type {object}
		 */
		this.axis = {
			x : d3.svg.axis().tickSize(-ths.vboxSize.height),
			y : d3.svg.axis().orient('left').tickSize(-ths.vboxSize.width)
		};

		/**
		 * Min and max zoom coeficient - 1 by default - without zoom
		 */
		this.zoomBehavior = d3.behavior.zoom().scaleExtent([0.0001, 10000]);

		/**
		 * Transfor attribute for the graph wrap, to manage a zoom behavior
		 * @type {object}
		 */
		this.zoomTransform = ko.observable({
				scale : 1,
				translate : [0, 0]
			});

		/**
		 * A transform string for a zoom behavior (transform attribute in a g element)
		 * @type {string}
		 */
		this.zoomTransformString = ko.computed({
				read : function () {
					var tmpZoomTransform = ko.unwrap(ths.zoomTransform);
					return 'translate(' + tmpZoomTransform.translate.join() + '), scale(' + tmpZoomTransform.scale + ')';
				},
				deferEvaluation : true
			});

		/**
		 * A zoom-in method for a graph
		 */
		this.zoomIn = function () {
			var prevZoomTransform = ko.unwrap(ths.zoomTransform);
			prevZoomTransform.scale += 0.1;
			ths.zoomTransform(prevZoomTransform);
      
      // Zoom coefficient for plus/minus buttons
			// var scaleCoef = 1.1;
			// var diffX = (graph.vboxSize.width / 2) * (scaleCoef - 1),
			// diffY = (graph.vboxSize.height / 2) * (scaleCoef - 1);
			// graphWrap.select('.zoom-in').on('click', function () {
			// graph.zoom.scale(graph.zoom.scale() * scaleCoef);

			// var tmpTr = graph.zoom.translate();
			// tmpTr[0] -= diffX;
			// tmpTr[1] -= diffY;
			// graph.zoom.translate(tmpTr);

			// redrawGraphData(graphWrap, graph.svgPath, dataSet, tmpParams);
			// redrawGraphAxis(graphWrap, graph.axis);
			// });
		};

		this.zoomOut = function () {
			var prevZoomTransform = ko.unwrap(ths.zoomTransform);
			prevZoomTransform.scale -= 0.1;
			ths.zoomTransform(prevZoomTransform);
			// graphWrap.select('.zoom-out').on('click', function () {
			// ////if (tmpSc > 1) {
			// graph.zoom.scale(graph.zoom.scale() / scaleCoef);

			// var tmpTr = graph.zoom.translate();
			// tmpTr[0] += diffX;
			// tmpTr[1] += diffY;
			// graph.zoom.translate(tmpTr);

			// redrawGraphData(graphWrap, graph.svgPath, dataSet, tmpParams);
			// redrawGraphAxis(graphWrap, graph.axis);
			// });
		};
	};

	return exports;
});
