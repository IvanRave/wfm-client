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
			width : ths.vboxOutSize.width - ths.vboxMargin.left - ths.vboxMargin.right,
			height : ths.vboxOutSize.height - ths.vboxMargin.top - ths.vboxMargin.bottom
		};

		/**
		 * An attribute for a group of the block: like top-left padding
		 * @type {string}
		 */
		this.baseTransform = 'translate(' + ths.vboxMargin.left + ', ' + ths.vboxMargin.top + ')';

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
    this.zoomTransform.valueHasMutated();
	};

	/**
	 * Get center of a vbox
	 * @returns {Array} - Center cooords, like [x, y]
	 */
	exports.prototype.getVboxCenter = function () {
		return [this.vboxSize.width / 2, this.vboxSize.height / 2];
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
			//.scale(tmpTr.scale).translate(tmpTr.translate);
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
	 * A zoom-out method
	 */
	exports.prototype.zoomOut = function () {
		console.log('zoomOut is fired');
		var prevZoomTransform = ko.unwrap(this.zoomTransform);
		prevZoomTransform.scale /= scaleCoef;

		var tmpDiff = {
			x : (this.vboxSize.width / 2) * (prevZoomTransform.scale - 1),
			y : (this.vboxSize.height / 2) * (prevZoomTransform.scale - 1)
		};

		prevZoomTransform.translate.x += tmpDiff.x;
		prevZoomTransform.translate.y += tmpDiff.y;

		this.setZoomTransform(prevZoomTransform.scale, prevZoomTransform.translate);
	};

	/**
	 * A zoom-in method for a graph
	 */
	exports.prototype.zoomIn = function () {
		console.log('zoomIn is fired');
		var prevZoomTransform = ko.unwrap(this.zoomTransform);
		prevZoomTransform.scale *= scaleCoef;

		var tmpDiff = {
			x : (this.vboxSize.width / 2) * (prevZoomTransform.scale - 1),
			y : (this.vboxSize.height / 2) * (prevZoomTransform.scale - 1)
		};

		prevZoomTransform.translate.x -= tmpDiff.x;
		prevZoomTransform.translate.y -= tmpDiff.y;

		this.setZoomTransform(prevZoomTransform.scale, prevZoomTransform.translate);
		// auto setting zoom behavior
	};

	return exports;
});
