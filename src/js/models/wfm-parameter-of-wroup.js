/** @module */
define(['knockout', 'models/wfm-parameter'], function (ko, WfmParameter) {
	'use strict';

	/**
	 * Parameter (union) for test or perfomance data. Every well group has own array of wfm parameters.
	 * @constructor
	 * @param {object} data - Parameter data
	 * @param {module:models/wroup} wellGroupItem - Well group (parent of parameter)
	 */
	var exports = function (data, wellGroupItem) {
		data = data || {};

		var ths = this;

		/**
		 * Get well group (parent)
		 * @returns {module:models/wroup} Well group (parent)
		 */
		this.getWellGroup = function () {
			return wellGroupItem;
		};

		/**
		 * Well group (parent) id
		 * @type {number}
		 */
		this.wellGroupId = data.WellGroupId;

		/**
		 * Wfm parameter id
     * @type {string}
		 */
		this.wfmParameterId = data.WfmParameterId;

		/**
		 * Serial number (order number)
		 * @type {number}
		 */
		this.serialNumber = ko.observable(data.SerialNumber);

		/**
		 * Parameter color, specified for this well group. Ovveride default color of parameter.
		 * @type {string}
		 */
		this.color = ko.observable(data.Color);

		// Moved to viewmodel (different for diff views)
		// /**
		// * Whether parameter is visible on the test or the perfomance page
		// * @type {boolean}
		// */
		// this.isVisible = ko.observable(true);

		/**
		 * Whether parameter can be calculated from other parameters
		 * @type {boolean}
		 */
		this.isCalc = ko.observable(false);

		/**
		 * Wfm parameter (global parameter definition - not only for this group)
		 * @type {module:models/wfm-parameter}
		 */
		this.wfmParameter = ko.observable();

		// When create temp parameter for POST request - this data is not exists
		if (data.WfmParameterDto) {
			this.wfmParameter(new WfmParameter(data.WfmParameterDto));

			// If no color then use default color from wfm parameter
			if (!ko.unwrap(this.color)) {
				this.color(ko.unwrap(ko.unwrap(ths.wfmParameter).defaultColor));
			}
		}

		this.toPlainJson = function () {
			return ko.toJS(ths);
		};
	};

	return exports;
});
