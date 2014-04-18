/** @module */
define(['knockout',
		'd3',
		'helpers/app-helper'], function (ko,
		d3,
		appHelper) {
	'use strict';

	var exports = {};

	var genFromParamX = function (tmpXScale, d) {
		return tmpXScale(new Date(ko.unwrap(d.unixTime) * 1000));
	};

	var genFromParamY = function (tmpYScale, idOfWfmParam, uomCoef, d) {
		// parameter id, like CSG, WaterRate ...
		var tmpVal = ko.unwrap(d.dict[idOfWfmParam]);
		return tmpYScale(appHelper.isNumeric(tmpVal) ? (tmpVal * uomCoef) : null);
	};

	exports.genFromParam = function (tmpRecords, tmpXScale, tmpYScale, vwmParamItem) {
		var tmpWfmParam = ko.unwrap(vwmParamItem.mdlWfmParameterOfWroup.wfmParameter);
		var idOfWfmParam = tmpWfmParam.id;
		var uomCoef = ko.unwrap(tmpWfmParam.uomCoef);

		/**
		 * Create line with d3 lib
		 *    https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-line
		 */
		var generateLinePath = d3.svg.line()
			.interpolate('monotone') // monotone or linear
			.x(genFromParamX.bind(null, tmpXScale))
			.y(genFromParamY.bind(null, tmpYScale, idOfWfmParam, uomCoef));

		return {
			prmPath : generateLinePath(tmpRecords),
			prmStroke : ko.unwrap(vwmParamItem.mdlWfmParameterOfWroup.color),
			prmVisible : ko.unwrap(vwmParamItem.isVisible)
		};
	};

	/**
	 * Handle border for cycle
   * @param {Array} borders - Non primitive type to calc min and max values
	 */
	function handleBorder(borders, tmpRecord) {
		var tmpDict = tmpRecord.dict;
		for (var paramKey in tmpDict) {
			if (tmpDict.hasOwnProperty(paramKey)) {
				var paramVal = ko.unwrap(tmpDict[paramKey]);
				if (appHelper.isNumeric(paramVal)) {
					// Set min and max values if they are null
					if (borders[0] === null && borders[1] === null) {
						borders[0] = borders[1] = paramVal;
					} else {
						borders[0] = Math.min(borders[0], paramVal);
						borders[1] = Math.max(borders[1], paramVal);
					}
				}
			}
		}
	}

	/**
	 * Get a value border array
	 * @returns {Array} - [min, max] values
	 */
	exports.getValueBorderArr = function (koTmpRecords) {
		var tmpRecords = ko.unwrap(koTmpRecords);
		// var minVal = null,
		// maxVal = null;
    var borders = [null, null];

		tmpRecords.forEach(handleBorder.bind(this, borders), this);

		// Elements of this array can be null
    console.log('value borders: ', borders);
		return borders;
	};

	return exports;
});
