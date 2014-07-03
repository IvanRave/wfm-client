/** @module */
define([], function () {
	'use strict';

	/**
	 * Unit helper
	 */
	var exports = {};

	exports.getUomCoefFromDict = function (needUom, needCoefDict) {
		var result;
		for (var coefGroup in needCoefDict) {
			if (needCoefDict.hasOwnProperty(coefGroup)) {
				for (var coefItem in needCoefDict[coefGroup]) {
					if (needCoefDict[coefGroup].hasOwnProperty(coefItem)) {
						if (needUom === coefItem) {
							result = needCoefDict[coefGroup][coefItem];
						}
					}
				}
			}
		}

		return result;
	};

	// [['bbl'],['d']] -> bbl/d
	// [['kg','m'], ['s']] -> kg*m/s
	exports.convertMatrixToStr = function (uomMatrix) {
		// [['kg','m'], ['s']] -> ['kg*m','s']
		var groupArr = [];
		for (var i = 0; i < uomMatrix.length; i += 1) {
			groupArr.push(uomMatrix[i].join('*'));
		}

		// ['kg*m','s'] -> kg*m/s
		return groupArr.join('/');
	};

	// bbl/d -> [['bbl'],['d']]
	// kg*m/s -> [['kg','m'], ['s']]
	exports.convertStrToMatrix = function (uomStr) {
		// divide by numerator and denominator
		var tmpList = uomStr.split('/');

		var readyMatrix = [];
		for (var i = 0; i < tmpList.length; i += 1) {
			readyMatrix.push(tmpList[i].split('*'));
		}

		return readyMatrix;
	};

	return exports;
});
