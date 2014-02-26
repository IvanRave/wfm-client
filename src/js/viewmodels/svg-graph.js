/** @module */
define(['jquery', 'knockout', 'd3'], function ($, ko, d3) {
	'use strict';

	/**
	 * A coefficient for zooming
	 * @type {number}
	 * @const
	 */
	var scaleCoef = 1.2;

	/**
	 * Svg graph
	 *    used in the monitoring and perfomance sections (and may be in another)
	 * @constructor
   * @param {Array} koTimeBorder - Observable array with start and end unix times, 
   *        like [124124,5425235] - elements of this array can be null
   * @param {Array} koValueBorder - Observable array with min and max values for all curves, like [-12.432, 543]
   * @param {Array.<object>} koPaths - Observable array of path objects 
   *        [{prmStroke: "#fff", prmPath: "M0 0 Z", prmVisible: true},{...}]
	 */
	var exports = function (koTimeBorder, koValueBorder, koPaths) {
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
    * Svg scale functions for a x-axis and y-axis
    */
		this.scaleObj = {
			x : ko.computed({
				read : function () {
					var tmpTimeBorder = ko.unwrap(koTimeBorder);
					if ($.isNumeric(tmpTimeBorder[0]) && $.isNumeric(tmpTimeBorder[1])) {
						// some x-scale function
						return d3.time.scale()
						.domain([new Date(tmpTimeBorder[0] * 1000), new Date(tmpTimeBorder[1] * 1000)])
						.range([0, ths.vboxSize.width]);
					}
				},
				deferEvaluation : true
			}),
			y : ko.computed({
				read : function () {
					var tmpValueBorder = ko.unwrap(koValueBorder);

					if ($.isNumeric(tmpValueBorder[0]) && $.isNumeric(tmpValueBorder[1])) {
						return d3.scale.linear()
						.domain(tmpValueBorder)
						.range([ths.vboxSize.height, 0]);
					}
				},
				deferEvaluation : true
			})
		};

		/**
		 * Axis for the graph
		 * @type {object}
		 */
		this.axis = {
			x : ko.computed({
				read : function () {
					var tmpZoomTransform = ko.unwrap(ths.zoomTransform);
					if (tmpZoomTransform) {

						var tmpXScale = ko.unwrap(ths.scaleObj.x);
						if (tmpXScale) {
							return d3.svg.axis()
							.scale(tmpXScale)
							.tickSize(-ths.vboxSize.height);
						}
					}
				},
				deferEvaluation : true
			}),
			y : ko.computed({
				read : function () {
					var tmpZoomTransform = ko.unwrap(ths.zoomTransform);
					if (tmpZoomTransform) {

						var tmpYScale = ko.unwrap(ths.scaleObj.y);
						if (tmpYScale) {
							return d3.svg.axis()
							.scale(tmpYScale)
							.orient('left')
							.tickSize(-ths.vboxSize.width);
						}
					}
				},
				deferEvaluation : true
			})
		};

		/**
		 * Transfor attribute for the graph wrap, to manage a zoom behavior
		 * @type {object}
		 */
		this.zoomTransform = ko.observable({});

		/**
		 * Set to default values
		 */
		this.setZoomTransformToDefault = function () {
			ths.zoomTransform({
				scale : 1,
				translate : [0, 0]
			});
		};

		function updateZoom(tmpScale, tmpTranslate) {
			var tmpZoomTransform = {
				scale : tmpScale,
				translate : tmpTranslate
			};

			// Set new zoom values to the block with data lines
			ths.zoomTransform(tmpZoomTransform);
		}

		/**
		 * Min and max zoom coeficient - 1 by default - without zoom
		 */
		this.zoomBehavior = ko.computed({
				read : function () {
					var tmpXScale = ko.unwrap(ths.scaleObj.x),
					tmpYScale = ko.unwrap(ths.scaleObj.y);

					if (tmpXScale && tmpYScale) {
						// When set a new behavior
						// Reload zoomTransofr to default values
						ths.setZoomTransformToDefault();

						return d3.behavior.zoom()
						.x(tmpXScale)
						.y(tmpYScale)
						.scaleExtent([0.0001, 10000]).on('zoom', function () {
							updateZoom(d3.event.scale, d3.event.translate);
						});
					}
				},
				deferEvaluation : true
			});

		/**
		 * A zoom-in method for a graph
		 */
		this.zoomIn = function () {
			var tmpZoomBehavior = ko.unwrap(ths.zoomBehavior);
			if (!tmpZoomBehavior) {
				return;
			}

			var prevZoomTransform = ko.unwrap(ths.zoomTransform);
			prevZoomTransform.scale *= scaleCoef;

			var tmpDiff = {
				x : (ths.vboxSize.width / 2) * (prevZoomTransform.scale - 1),
				y : (ths.vboxSize.height / 2) * (prevZoomTransform.scale - 1)
			};

			prevZoomTransform.translate.x -= tmpDiff.x;
			prevZoomTransform.translate.y -= tmpDiff.y;

			tmpZoomBehavior.translate(prevZoomTransform.translate);
			tmpZoomBehavior.scale(prevZoomTransform.scale);

			updateZoom(prevZoomTransform.scale, prevZoomTransform.translate);
		};

		/**
		 * A zoom-out method
		 */
		this.zoomOut = function () {
			var tmpZoomBehavior = ko.unwrap(ths.zoomBehavior);
			if (!tmpZoomBehavior) {
				return;
			}
			var prevZoomTransform = ko.unwrap(ths.zoomTransform);
			prevZoomTransform.scale /= scaleCoef;

			var tmpDiff = {
				x : (ths.vboxSize.width / 2) * (prevZoomTransform.scale - 1),
				y : (ths.vboxSize.height / 2) * (prevZoomTransform.scale - 1)
			};

			prevZoomTransform.translate.x += tmpDiff.x;
			prevZoomTransform.translate.y += tmpDiff.y;

			tmpZoomBehavior.translate(prevZoomTransform.translate);
			tmpZoomBehavior.scale(prevZoomTransform.scale);

			updateZoom(prevZoomTransform.scale, prevZoomTransform.translate);
			//ths.zoomTransform(prevZoomTransform);
		};
    
    /**
    * Paths (graph lines)
    * @type {Array.<object>}
    */
    this.paths = koPaths;
	};

	return exports;
});
