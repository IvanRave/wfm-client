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
		// Add base props - the block with a zero-zoom by default
		SvgBlock.call(this,
			1 / 3,
			1200,
			ko.observable({
				scale : 1,
				translate : [0, 0]
			}));

		this.timeBorder = koTimeBorder;
		this.valueBorder = koValueBorder;

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
		 * Inner size of the block in svg units
		 * @type {object}
		 */
		this.vboxSize = {
			width : this.vboxOutSize.width - this.vboxMargin.left - this.vboxMargin.right,
			height : this.vboxOutSize.height - this.vboxMargin.top - this.vboxMargin.bottom
		};
    
    /**
		 * An attribute for a group of the block: like top-left padding
		 * @type {string}
		 */
		this.baseTransform = 'translate(' + this.vboxMargin.left + ', ' + this.vboxMargin.top + ')';
    
		/**
		 * An attribute for the X axis of the graph
		 * @type {string}
		 */
		this.axisXTransform = 'translate(0,' + this.vboxSize.height + ')';

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
		 * Paths (graph lines)
		 * @type {Array.<object>}
		 */
		this.paths = koPaths;
	};

	// Inherit a prototype from the SvgBlock class
	appHelper.inherits(exports, SvgBlock);

	/** Get X axis */
	exports.prototype.getAxisX = function () {
		var tmpZoomTransform = ko.unwrap(this.zoomTransform);
		if (tmpZoomTransform) {

			var tmpXScale = ko.unwrap(this.scaleX);
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

			var tmpYScale = ko.unwrap(this.scaleY);
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
  
  /**
	 * A zoom-in method for a graph
	 */
	exports.prototype.zoomIn = function () {
    exports.superClass_.zoomInOut.call(this, this.vboxSize.width, this.vboxSize.height, 1);
	};

  /**
	 * A zoom-out method
	 */
	exports.prototype.zoomOut = function () {
    exports.superClass_.zoomInOut.call(this, this.vboxSize.width, this.vboxSize.height, -1);
	};

	return exports;
});
