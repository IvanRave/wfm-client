/** @module */
define(['viewmodels/svg-block',
		'helpers/app-helper'],
	function (SvgBlock,
		appHelper) {
	'use strict';

	/**
	 * Svg map
	 *    used in the wield and well map sections
	 * @constructor
	 * @augments {module:viewmodels/svg-block}
	 */
	var exports = function () {
		// Add base props
		SvgBlock.call(this, 1 / 2, 1200);
	};
  
  // Inherit a prototype from the SvgBlock class
	appHelper.inherits(exports, SvgBlock);

	return exports;
});
