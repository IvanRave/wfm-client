/** @module */
define(['knockout',
		'helpers/uom-helper',
		'constants/uom-constants'], function (ko,
		uomHelper,
		uomCoefDict) {
	'use strict';

	/**
	 * Parameter, like OilRate, WaterRate etc.
	 * @constructor
	 * @param {object} data - Parameter data
	 */
	var exports = function (data) {
		data = data || {};

		/**
		 * Parameter id (OilRate, WaterRate, etc.)
		 * @type {string}
		 */
		this.id = data.Id;

		/**
		 * Parameter name (Oil rate, water rate, etc.)
		 * @todo feat: redefine in wroup parameters #MM!
		 * @type {string}
		 */
		this.name = ko.observable(data.Name);

		/**
		 * Unit of measurement (scf, barrels, etc.)
		 * @todo feat: redefine in wroup parameters #MM!
		 * @type {string}
		 */
		this.uom = ko.observable(data.Uom);

		// Todo: need to store in db as this array
		// For Newton: [[kg,m],[s,s]]
		// For Speed: [[m],[s,s]]
		// For Gas: [[f, f, f]] or [[scf]] - standard cubic feet
		this.sourceUomMatrix = uomHelper.convertStrToMatrix(data.Uom);

		this.uomMatrix = ko.computed({
				read : this.calcUomMatrix,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Default hex color of this parameter: can be redefined in the wroup parameter
		 * @type {string}
		 */
		this.defaultColor = ko.observable(data.DefaultColor);

		/**
		 * Whether this parameter is cumulative
		 * @todo feat: redefine in wroup parameters #MM!
		 *       during change need to change squad (for example from Rate to Cumulative)
		 * @type {bool}
		 */
		this.isCumulative = ko.observable(data.IsCumulative);

		/**
		 * Whether this parameter is system: used in program logic and can't be deleted
		 * @type {bool}
		 */
		this.isSystem = ko.observable(data.IsSystem);

		/**
		 * Id of the squad of parameters ('rate', 'cumulative'...)
		 * @type {string}
		 */
		this.wfmParamSquadId = ko.observable(data.WfmParamSquadId);

		// If user wants to remember coef state than use cookies and change after initialization
		this.uomCoef = ko.computed({
				read : this.calcUomCoef.bind(this),
				deferEvaluation : true,
				owner : this
			});

		this.toPlainJson = function () {
			return ko.toJS(this);
		};
	};

	/**
	 * Calculate a coef for an unit
	 * @private
	 */
	exports.prototype.calcUomCoef = function () {
		var coef = 1;

		var currentUomMatrix = ko.unwrap(this.uomMatrix);
		for (var i = 0; i < this.sourceUomMatrix.length; i += 1) {
			for (var j = 0; j < this.sourceUomMatrix[i].length; j += 1) {
				var curItem = currentUomMatrix[i][j];
				var srcItem = this.sourceUomMatrix[i][j];

				if (curItem !== srcItem) {
					// get coef (only for changed values)
					if (i === 0) {
						// If numerator (first value in array)
						coef *= uomHelper.getUomCoefFromDict(srcItem, uomCoefDict) / uomHelper.getUomCoefFromDict(curItem, uomCoefDict);
					} else if (i === 1) {
						// If denominator (second value in array)
						coef /= uomHelper.getUomCoefFromDict(srcItem, uomCoefDict) / uomHelper.getUomCoefFromDict(curItem, uomCoefDict);
					}
				}
			}
		}

		return coef;
	};

	/**
	 * Select box for changing unit
	 */
	exports.prototype.changeSelectedUom = function (selectedUom, selectedUomSquadPosition, selectedUomPosition) {
		////var prevSelectedUom = self.uomMatrix()[selectedUomSquadPosition][selectedUomPosition];
		var uomMatrixNew = ko.unwrap(this.uomMatrix).slice();
		uomMatrixNew[selectedUomSquadPosition][selectedUomPosition] = selectedUom;
		this.uom(uomHelper.convertMatrixToStr(uomMatrixNew));
	};

	/**
	 *  List of possible units of measurements (for choosed uom)
	 */
	exports.prototype.getPossibleUomListForSelectedUom = function (selectedUom) {
		// choose group for need unit of measurement
		var needGroup;
		for (var uomCoefGroup in uomCoefDict) {
			if (uomCoefDict.hasOwnProperty(uomCoefGroup)) {
				for (var uomCoefItem in uomCoefDict[uomCoefGroup]) {
					if (uomCoefDict[uomCoefGroup].hasOwnProperty(uomCoefItem)) {
						if (uomCoefItem === selectedUom) {
							needGroup = uomCoefDict[uomCoefGroup];
						}
					}
				}
			}
		}

		var resultList = [];
		// convert group to array (exclude need uom)
		if (needGroup) {
			for (var uomCoefMain in needGroup) {
				if (needGroup.hasOwnProperty(uomCoefMain)) {
					if (uomCoefMain !== selectedUom) {
						resultList.push(uomCoefMain);
					}
				}
			}
		}

		return resultList;
	};

	/**
	 * Calc a matrix for an unit
	 * @private
	 */
	exports.prototype.calcUomMatrix = function () {
		return uomHelper.convertStrToMatrix(ko.unwrap(this.uom));
	};

	return exports;
});
