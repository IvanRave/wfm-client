/** @module */
define(['jquery', 'knockout', 'd3',
		'helpers/app-helper',
		'viewmodels/svg-block'],
	function ($,
		ko,
		d3,
		appHelper,
		SvgBlock) {
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
	 * @augments {module:viewmodels/svg-block}
	 * @param {Array} koTimeBorder - Observable array with start and end unix times,
	 *        like [124124,5425235] - elements of this array can be null
	 * @param {Array} koValueBorder - Observable array with min and max values for all curves, like [-12.432, 543]
	 * @param {Array.<object>} koPaths - Observable array of path objects
	 *        [{prmStroke: "#fff", prmPath: "M0 0 Z", prmVisible: true},{...}]
	 */
	var exports = function (koTimeBorder, koValueBorder, koPaths) {
		// Add base props
		SvgBlock.call(this, 1 / 3, 1200);

    this.timeBorder = koTimeBorder;
    this.valueBorder = koValueBorder;
    
		/**
		 * An attribute for the X axis of the graph
		 * @type {string}
		 */
		this.axisXTransform = 'translate(0,' + this.vboxSize.height + ')';

		/**
		 * Svg scale functions for a x-axis and y-axis
		 */
		this.scaleObj = {
			x : ko.computed({
				read : this.getScaleX,
				deferEvaluation : true,
				owner : this
			}),
			y : ko.computed({
				read : this.getScaleY,
				deferEvaluation : true,
				owner : this
			})
		};

		/**
		 * Axis for the graph
		 * @type {object}
		 */
		this.axis = {
			x : ko.computed({
				read : this.getAxisX,
				deferEvaluation : true,
				owner : this
			}),
			y : ko.computed({
				read : this.getAxisY,
				deferEvaluation : true,
				owner : this
			})
		};

		/**
		 * Min and max zoom coeficient - 1 by default - without zoom
		 */
		this.zoomBehavior = ko.computed({
				read : this.buildZoomBehavior,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Paths (graph lines)
		 * @type {Array.<object>}
		 */
		this.paths = koPaths;
	};

	// Inherit a prototype from the SvgBlock class
	appHelper.inherits(exports, SvgBlock);

	/**
	 * A zoom-out method
	 */
	exports.prototype.zoomOut = function () {
		var tmpZoomBehavior = ko.unwrap(this.zoomBehavior);
		if (!tmpZoomBehavior) {
			return;
		}
		var prevZoomTransform = ko.unwrap(this.zoomTransform);
		prevZoomTransform.scale /= scaleCoef;

		var tmpDiff = {
			x : (this.vboxSize.width / 2) * (prevZoomTransform.scale - 1),
			y : (this.vboxSize.height / 2) * (prevZoomTransform.scale - 1)
		};

		prevZoomTransform.translate.x += tmpDiff.x;
		prevZoomTransform.translate.y += tmpDiff.y;

		tmpZoomBehavior.translate(prevZoomTransform.translate);
		tmpZoomBehavior.scale(prevZoomTransform.scale);

		this.setZoomTransform(prevZoomTransform.scale, prevZoomTransform.translate);
		//this.zoomTransform(prevZoomTransform);
	};

	/**
	 * A zoom-in method for a graph
	 */
	exports.prototype.zoomIn = function () {
		var tmpZoomBehavior = ko.unwrap(this.zoomBehavior);
		if (!tmpZoomBehavior) {
			return;
		}

		var prevZoomTransform = ko.unwrap(this.zoomTransform);
		prevZoomTransform.scale *= scaleCoef;

		var tmpDiff = {
			x : (this.vboxSize.width / 2) * (prevZoomTransform.scale - 1),
			y : (this.vboxSize.height / 2) * (prevZoomTransform.scale - 1)
		};

		prevZoomTransform.translate.x -= tmpDiff.x;
		prevZoomTransform.translate.y -= tmpDiff.y;

		tmpZoomBehavior.translate(prevZoomTransform.translate);
		tmpZoomBehavior.scale(prevZoomTransform.scale);

		this.setZoomTransform(prevZoomTransform.scale, prevZoomTransform.translate);
	};

	/**
	 * Build a zoom behavior
	 */
	exports.prototype.buildZoomBehavior = function () {
		var tmpXScale = ko.unwrap(this.scaleObj.x),
		tmpYScale = ko.unwrap(this.scaleObj.y);

		if (tmpXScale && tmpYScale) {
			// When set a new behavior
			// Reload zoomTransofr to default values (without options - set to default)
			this.setZoomTransform();

			var ths = this;
			return d3.behavior.zoom()
			.x(tmpXScale)
			.y(tmpYScale)
			.scaleExtent([0.0001, 10000]).on('zoom', function () {
				ths.setZoomTransform(d3.event.scale, d3.event.translate);
			});
		}
	};

	/** Get X axis */
	exports.prototype.getAxisX = function () {
		var tmpZoomTransform = ko.unwrap(this.zoomTransform);
		if (tmpZoomTransform) {

			var tmpXScale = ko.unwrap(this.scaleObj.x);
			if (tmpXScale) {
				return d3.svg.axis()
				.scale(tmpXScale)
				.tickSize(-this.vboxSize.height);
			}
		}
	};

	/** Get Y axis */
	exports.prototype.getAxisY = function () {
		var tmpZoomTransform = ko.unwrap(this.zoomTransform);
		if (tmpZoomTransform) {

			var tmpYScale = ko.unwrap(this.scaleObj.y);
			if (tmpYScale) {
				return d3.svg.axis()
				.scale(tmpYScale)
				.orient('left')
				.tickSize(-this.vboxSize.width);
			}
		}
	};

	/** Get X scale */
	exports.prototype.getScaleX = function () {
		var tmpTimeBorder = ko.unwrap(this.timeBorder);
		if ($.isNumeric(tmpTimeBorder[0]) && $.isNumeric(tmpTimeBorder[1])) {
			// some x-scale function
			return d3.time.scale()
			.domain([new Date(tmpTimeBorder[0] * 1000), new Date(tmpTimeBorder[1] * 1000)])
			.range([0, this.vboxSize.width]);
		}
	};

	/** Get Y scale */
	exports.prototype.getScaleY = function () {
		var tmpValueBorder = ko.unwrap(this.valueBorder);

		if ($.isNumeric(tmpValueBorder[0]) && $.isNumeric(tmpValueBorder[1])) {
			return d3.scale.linear()
			.domain(tmpValueBorder)
			.range([this.vboxSize.height, 0]);
		}
	};

	return exports;
});
