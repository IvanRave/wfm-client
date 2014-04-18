/** @module */
define(['knockout',
		'models/wfm-parameter',
		'services/wfm-parameter-of-wroup'],
	function (ko,
		WfmParameter,
		wfmParameterOfWroupService) {
	'use strict';

	/**
	 * Parameter (union) for test or perfomance data. Every well group has own array of wfm parameters.
	 * @constructor
	 * @param {object} data - Parameter data
	 * @param {module:models/wroup} wellGroupItem - Well group (parent of parameter)
	 */
	var exports = function (data, wellGroupItem) {
		data = data || {};

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

		/**
		 * Unit of measure
		 *    overrided a wfm-parameter property
		 * @type {string}
		 */
		this.uom = ko.observable(data.Uom);

		/**
		 * Whether this parameter is monitored (well or platform monitoring)
		 * @type {boolean}
		 */
		this.isMonitored = ko.observable(data.IsMonitored);

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

		if (!data.WfmParameterDto) {
			console.log('TODO: remove');
		}

		// When create temp parameter for POST request - this data is not exists
		if (data.WfmParameterDto) {
      console.log('try to find a parameter from loaded parameters');
			this.wfmParameter(new WfmParameter(data.WfmParameterDto));
		}

		// Subscribe events (only after function and props initialization)

		this.isMonitored.subscribe(this.save, this);
		this.color.subscribe(this.save, this);
    this.uom.subscribe(this.save, this);
	};

	/**
	 * Save the wfm parameter
	 */
	exports.prototype.save = function () {
		wfmParameterOfWroupService.put(this.wellGroupId, this.wfmParameterId, {
			WellGroupId : this.wellGroupId,
			WfmParameterId : this.wfmParameterId,
			IsMonitored : ko.unwrap(this.isMonitored),
			Color : ko.unwrap(this.color),
			SerialNumber : ko.unwrap(this.serialNumber),
			Uom : ko.unwrap(this.uom)
		});
	};

	return exports;
});
