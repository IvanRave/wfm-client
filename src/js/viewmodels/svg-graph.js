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
      width: 1200,
      height: 400
    };
    
    /**
    * Margins for axis and some space
    * @type {object}
    */
    this.vboxMargin = {
      top: 10,
      right: 30,
      bottom: 20,
      left: 60
    };
    
    /**
    * Inner size of the graph in svg units
    * @type {object}
    */
    this.vboxSize = {
      width: ths.vboxOutSize.width - ths.vboxMargin.left - ths.vboxMargin.right,
      height: ths.vboxOutSize.height - ths.vboxMargin.top - ths.vboxMargin.bottom
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
	};

	return exports;
});
