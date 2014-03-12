/** @module */
define(['jquery',
		'knockout',
		'd3'],
	function ($, ko, d3) {
	'use strict';

	/**
	 * A coefficient for zooming
	 * @type {number}
	 * @const
	 */
	var scaleCoef = 1.2;

	/**
	 * Svg block: parent of the svgMap and svgGraph objects
	 * @constructor
	 * @param {number} tmpRatio - A block ratio
	 */
	var exports = function (tmpRatio, tmpVboxWidth, koTransform) {
		var ths = this;

		/**
		 * A standard ratio for the block
		 * @type {number}
		 */
		this.ratio = tmpRatio;

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
			width : tmpVboxWidth,
			height : tmpVboxWidth * ths.ratio
		};

		/**
		 * Svg scale functions for a x-axis and y-axis
		 */
		this.scaleX = ko.computed({
				read : this.getScaleX,
				deferEvaluation : true,
				owner : this
			});

		this.scaleY = ko.computed({
				read : this.getScaleY,
				deferEvaluation : true,
				owner : this
			});

		this.scaleX.subscribe(this.updateZoomScale, this);
		this.scaleY.subscribe(this.updateZoomScale, this);

		/**
		 * An observable transform attribute for the svg object, to manage a zoom behavior
		 *    Default value
		 * @type {object}
		 */
		this.zoomTransform = koTransform;

		/** An attribute to transforming the block */
		this.zoomTransformAttr = ko.computed({
				read : function () {
					var tmpTransform = ko.unwrap(this.zoomTransform);
					return 'translate(' + tmpTransform.translate.join(',') + ') scale(' + tmpTransform.scale + ')';
				},
				deferEvaluation : true,
				owner : this
			});

		this.baseZoomBhvr = d3.behavior.zoom()
			.scaleExtent([0.0001, 10000])
			.on('zoom', function () {
				ths.setZoomTransform(d3.event.scale, d3.event.translate);
			});

		this.zoomTransform.subscribe(this.buildZoomBehavior, this);

		// Apply default values to the behavior
		//    before an user will fired a zoom event by scrolling or panning
		//    in this case - values will be null (scale: 1, translate [0,0]
		this.zoomTransform.valueHasMutated();
	};

	/**
	 * Set to default values
	 * @param {number} [optScale=1] - Current element's scale option
	 * @param {Array} [optTranslate=[0,0]] - Current element's translate option
	 */
	exports.prototype.setZoomTransform = function (optScale, optTranslate) {
		this.zoomTransform({
			// Scale cannot be zero - in this case a map or graph doesn't exists
			scale : optScale || 1,
			translate : optTranslate || [0, 0]
		});
	};

	exports.prototype.updateZoomScale = function () {
		var tmpXScale = ko.unwrap(this.scaleX),
		tmpYScale = ko.unwrap(this.scaleY);

		if (tmpXScale && tmpYScale) {
			// When set a new behavior
			// Reload zoomTransform to default values (without options - set to default)
			//this.setZoomTransform();
			this.baseZoomBhvr.x(tmpXScale).y(tmpYScale);
		}
	};

	/**
	 * Build a zoom behavior
	 */
	exports.prototype.buildZoomBehavior = function () {
		// When set a new behavior
		// Reload zoomTransform to default values (without options - set to default)
		//this.setZoomTransform();

		// Get transform and apply to zoom behavior: optScale, optTranslate

		var tmpTr = ko.unwrap(this.zoomTransform);

		// If an event listener was already registered for the same type on the selected element,
		//     the existing listener is removed before the new listener is added.
		// To register multiple listeners for the same event type,
		//     the type may be followed by an optional namespace, such as "click.foo" and "click.bar".
		// Check: if zoom is changed from element (a zoom event) - no change
		var prevTr = {
			scale : this.baseZoomBhvr.scale(),
			translate : this.baseZoomBhvr.translate()
		};

		// If event was fired from the event of a zoom behavior - don't update
		if (prevTr.scale !== tmpTr.scale && prevTr.translate !== tmpTr.translate) {
			this.baseZoomBhvr.scale(tmpTr.scale).translate(tmpTr.translate);
		}
	};

	/**
	 * A zoom-in method for a graph
	 */
	exports.prototype.zoomInOut = function (elemWidth, elemHeight, zoomDirection) {
		// for example: {3, [10,20]}
		// scale = 3
		// left translate = 10
		// upper translate = 20
		var prevZoomTransform = ko.unwrap(this.zoomTransform);

    var prevScale = prevZoomTransform.scale;
    
		// new scale = 3*1.2 = 3.6
		var curScale;
		if (zoomDirection === 1) {
			curScale = prevScale * scaleCoef;
		} else {
			curScale = prevScale / scaleCoef;
		}

		// Round the scale (to decrease calculation faults with long numbers)
		curScale = Math.round(curScale * 1000) / 1000;

		// width = 3.6 * initial width
		// height = 3.6 * initial height

		// new left translate = [10 - new width / 2]
		// new upper translate = [20 - new height / 2]
		// vboxSize
    var sizeNew = {
      width: elemWidth * curScale,
      height: elemHeight * curScale
    };
    
    var sizePrev = {
      width: elemWidth * prevScale,
      height: elemHeight * prevScale
    };
    
		var tmpDiffX = (sizeNew.width - sizePrev.width) / 2,
		tmpDiffY = (sizeNew.height - sizePrev.height) / 2;

		var curX = prevZoomTransform.translate[0] - tmpDiffX; 
		var curY = prevZoomTransform.translate[1] - tmpDiffY; 

		this.setZoomTransform(curScale, [curX, curY]);
		// auto setting zoom behavior
	};

	return exports;
});
