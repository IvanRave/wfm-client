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
			this.wfmParameter(new WfmParameter(data.WfmParameterDto));

			// If no color then use default color from wfm parameter
			if (!ko.unwrap(this.color)) {
				this.color(ko.unwrap(ko.unwrap(ths.wfmParameter).defaultColor));
			}
		}
    
    /**
		 * Save the wfm parameter
		 */
		this.save = function () {
			wfmParameterOfWroupService.put(ths.wellGroupId, ths.wfmParameterId, {
				WellGroupId : ths.wellGroupId,
				WfmParameterId : ths.wfmParameterId,
				IsMonitored : ko.unwrap(ths.isMonitored),
				Color : ko.unwrap(ths.color),
				SerialNumber : ko.unwrap(ths.serialNumber)
			});
		};

    // Subscribe events (only after function and props initialization)
    
		this.isMonitored.subscribe(ths.save);
    this.color.subscribe(ths.save);

		this.toPlainJson = function () {
			return ko.toJS(ths);
		};
	};

	return exports;
});
