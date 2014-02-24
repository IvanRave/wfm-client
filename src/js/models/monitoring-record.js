/** @module */
define([
		'jquery',
		'knockout',
		'services/monitoring-record'],
	function ($, ko, monitoringRecordService) {
	'use strict';

	/**
	 * Model: a monitoring record (for a well and well field monitoring section)
	 * @constructor
	 * @param {object} koObjProcentBorders - to make computed properties:
	 *        difference between the aveDict and the dict with some procent border
	 *        red and green values in the table
	 */
	var exports = function (data, mntrParams, koObjProcentBorders) {
		data = data || {};

		var ths = this;

		/**
		 * Id of parent
		 * @type {number}
		 */
		this.idOfWell = data.IdOfWell;

		/**
		 * Time in unix format, in seconds. Can not be changed (at this time)
		 * @type {number}
		 */
		this.unixTime = ko.observable(data.UnixTime);

		// Need to create inputs for all monitoring properties
		// If a user removes some property (or checkoff monitoring status)
		//    then need to recreate all properties
		// When a user changes the value of some property, then need to upsert this record to the server
		//   a button or a subscribe event for every property

		/**
		 * Whether saving in progress
		 * @type {bool}
		 */
		this.isSaveProgress = ko.observable(false);

		/**
		 * Insert or update the record
		 */
		this.upsert = function () {
			// Check dict to numbers
			// And convert to numbers from string
      
      var tmpDict = ko.toJS(ths.dict);
      
			for (var tmpKey in tmpDict) {
        if ($.isNumeric(tmpDict[tmpKey])){
          tmpDict[tmpKey] = +tmpDict[tmpKey];
        }
        else if (!tmpDict[tmpKey]) { // check all exclude zero (zero - is number)
					tmpDict[tmpKey] = null; // set to null when empty
				}
        else {
					alert('Only numbers for ' + tmpKey + ": " + tmpDict[tmpKey]);
					return;
				}
			}
      
			ths.isSaveProgress(true);
			monitoringRecordService.upsert(ths.idOfWell, ko.unwrap(ths.unixTime), {
				IdOfWell : ths.idOfWell,
				UnixTime : ko.unwrap(ths.unixTime),
				Dict : tmpDict
			}).done(function () {
				ths.isSaveProgress(false);
			});
		};

		/**
		 * A dictionary with values of parameters
		 * @type {object}
		 */
		this.dict = {}; //data.Dict;

		/**
		 * A dictionary with average values of parameters (per last 30 days from unixTime, exclude current unixTime)
		 * @type {object}
		 */
		this.aveDict = {};

		/**
		 * A dictionary with differences between usual values and average values
		 *    in a procent view: whether difference is greater than the procent border value
		 * @type {object}
		 */
		this.diffDict = {};

		/**
		 * A dictionary with classes for difference results
		 * @type {object}
		 */
		this.diffClassDict = {};

		// May be null if no average data
		// Convert to empty object, to show null values of this object
		var aveData = data.AverageDict || {};

		// Fill usual values for parameters
		mntrParams.forEach(function (elem) {
			ths.dict[elem.wfmParameterId] = ko.observable(data.Dict[elem.wfmParameterId]);
			ths.dict[elem.wfmParameterId].subscribe(ths.upsert);
			// Fill average values for parameters (per last 30 days, exclude today)
			ths.aveDict[elem.wfmParameterId] = ko.observable(aveData[elem.wfmParameterId]);

			// Fill a dictionary with differences results
			ths.diffDict[elem.wfmParameterId] = ko.computed({
					read : function () {
						var tmpProcentBorder = ko.unwrap(koObjProcentBorders)[elem.wfmParameterId];
						if (tmpProcentBorder) {
							var tmpProcentValue = ko.unwrap(tmpProcentBorder.procent);
							// Number from 0 to 100 (procents)
							if ($.isNumeric(tmpProcentValue)) {
								// Convert to number
								tmpProcentValue = +tmpProcentValue;
								var tmpUsualVal = ko.unwrap(ths.dict[elem.wfmParameterId]);
								if ($.isNumeric(tmpUsualVal)) {
									// Convert to number
									tmpUsualVal = +tmpUsualVal;
									var tmpAveVal = ko.unwrap(ths.aveDict[elem.wfmParameterId]);
									if ($.isNumeric(tmpAveVal)) {
										// Convert to number
										tmpAveVal = +tmpAveVal;
										var absoluteProcent = tmpAveVal * (tmpProcentValue / 100); // result = number

										console.log('procent for elem ', elem.wfmParameterId, tmpProcentValue, absoluteProcent);

										if (tmpUsualVal > (tmpAveVal + absoluteProcent)) {
											// is out of the top border
											return true;
										} else if (tmpUsualVal < (tmpAveVal - absoluteProcent)) {
											// is out of the bottom border
											return true;
										} else {
											// is in borders (false - no warning)
											return false;
										}
									}
								}
							}
						}
					},
					deferEvaluation : true
				});

			// Fill classes for differences results
			ths.diffClassDict[elem.wfmParameterId] = ko.computed({
					read : function () {
						var tmpIsDiff = ko.unwrap(ths.diffDict[elem.wfmParameterId]);
						if (tmpIsDiff === true) {
							return 'danger';
						}
						if (tmpIsDiff === false) {
							return 'success';
						}
					},
					deferEvaluation : true
				});
		});
	};

	return exports;
});
