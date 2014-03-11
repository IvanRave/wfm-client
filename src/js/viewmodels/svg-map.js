/** @module */
define(['knockout',
		'viewmodels/svg-block',
		'helpers/app-helper',
		'd3'],
	function (
		ko,
		SvgBlock,
		appHelper,
		d3) {
	'use strict';

	/** Calculate svg image size using real size and svg block size */
	function calcImgSizeVg(imgWidthPx, imgHeightPx, vboxWidth, vboxHeight, vboxRatio) {
		var svgImgSize = {};
		// If height is bigger side, then calculate width
		// if height = 600svg (400px) then width = Xsvg (300px)
		// X = (300px * 600svg) / 400px
		// else if width = 1200svg (300px) then height = Ysvg (400px)
		// Y = (400px * 1200svg) / 300px
		if ((imgHeightPx / vboxRatio) > imgWidthPx) {
			svgImgSize.height = vboxHeight;
			svgImgSize.width = (imgWidthPx * vboxHeight) / imgHeightPx;
		} else {
			svgImgSize.width = vboxWidth;
			svgImgSize.height = (imgHeightPx * vboxWidth) / imgWidthPx;
		}

		return svgImgSize;
	}

	/**
	 * Svg map
	 *    used in the wield and well map sections
	 * @constructor
	 * @augments {module:viewmodels/svg-block}
	 */
	var exports = function (tmpImgUrl, tmpImgWidthPx, tmpImgHeightPx, koTransform) {
		// Add base props
		SvgBlock.call(this, 1 / 2, 1200, koTransform);

		this.imgUrl = tmpImgUrl;

		this.imgWidthPx = tmpImgWidthPx;

		this.imgHeightPx = tmpImgHeightPx;

		var tmpImgSizeVg = calcImgSizeVg(this.imgWidthPx, this.imgHeightPx,
				this.vboxOutSize.width, this.vboxOutSize.height, this.ratio);

		this.imgWidthVg = tmpImgSizeVg.width;

		this.imgHeightVg = tmpImgSizeVg.height;

		this.widthCoefVgToPx = this.imgWidthVg / this.imgWidthPx;

		this.heightCoefVgToPx = this.imgHeightVg / this.imgHeightPx;

		this.imgStartVgX = (this.vboxOutSize.width - this.imgWidthVg) / 2;

		this.imgStartVgY = (this.vboxOutSize.height - this.imgHeightVg) / 2;
	};

	// Inherit a prototype from the SvgBlock class
	appHelper.inherits(exports, SvgBlock);

	exports.prototype.getScaleX = function () {
		return d3.scale.linear().range([this.imgStartVgX, this.imgStartVgX + this.imgWidthVg]);
	};

	exports.prototype.getScaleY = function () {
		return d3.scale.linear().range([this.imgStartVgY, this.imgStartVgY + this.imgHeightVg]);
	};

	return exports;
});
