/** @module */
define(['jquery', 'knockout'], function ($, ko) {
	'use strict';

	/**
	 * Svg block: parent of the svgMap and svgGraph objects
	 * @constructor
	 * @param {number} tmpRatio - A block ratio
	 */
	var exports = function (tmpRatio, tmpVboxWidth) {
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
	};
  
  /**
  * Get center of a vbox
  * @returns {Array} - Center cooords, like [x, y]
  */
  exports.prototype.getVboxCenter = function(){
    return [this.vboxSize.width / 2, this.vboxSize.height / 2];
  };

	return exports;
});
