/** @module */
define(['knockout',
		'helpers/app-helper',
		'services/monitoring-record'],
	function (ko, appHelper, monitoringRecordService) {
	'use strict';

	/**
	 * Model: a monitoring record (for a well and well field monitoring section)
	 * @constructor
   * @param {Object} mtnrParams - Monitored parameters from a well group
   *        Need to calculate and load monitored params before generate this record
	 * @param {Object} koObjProcentBorders - to make computed properties:
	 *        difference between the aveDict and the dict with some procent border
	 *        red and green values in the table
	 */
	var exports = function (data, mntrParams, koObjProcentBorders) {
		data = data || {};

		/**
		 * Observable procent's borders
		 */
		this.koObjProcentBorders = koObjProcentBorders;

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

		/**
		 * Load all data
		 */
		this.loadData(data, mntrParams);
	};

	/**
	 * Load all data
	 */
	exports.prototype.loadData = function (data, mntrParams) {
		// May be null if no average data
		// Convert to empty object, to show null values of this object
		// Fill usual values for parameters
		mntrParams.forEach(this.loadItem.bind(this,
				(data.Dict || {}),
				(data.AverageDict || {})));
	};

	/**
	 * Load each item during the foreach cycle
	 */
	exports.prototype.loadItem = function (mainData, aveData, elem) {
		this.dict[elem.wfmParameterId] = ko.observable(mainData[elem.wfmParameterId]);
		this.dict[elem.wfmParameterId].subscribe(this.upsertMonitoringRecord, this);
		// Fill average values for parameters (per last 30 days, exclude today)
		this.aveDict[elem.wfmParameterId] = ko.observable(aveData[elem.wfmParameterId]);

		// Fill a dictionary with differences results
		this.diffDict[elem.wfmParameterId] = ko.computed({
				read : this.genDiffDictItem.bind(this, elem),
				deferEvaluation : true,
				owner : this
			});

		// Fill classes for differences results
		this.diffClassDict[elem.wfmParameterId] = ko.computed({
				read : this.genDiffClassItem.bind(this, elem),
				deferEvaluation : true,
				owner : this
			});
	};

	/**
	 * Generate a class for a record
	 */
	exports.prototype.genDiffClassItem = function (elem) {
		var tmpIsDiff = ko.unwrap(this.diffDict[elem.wfmParameterId]);
		if (tmpIsDiff === true) {
			return 'danger';
		}
		if (tmpIsDiff === false) {
			return 'success';
		}
	};

	/**
	 * Generate data for a record
	 */
	exports.prototype.genDiffDictItem = function (elem) {
		var tmpProcentBorder = ko.unwrap(this.koObjProcentBorders)[elem.wfmParameterId];
		if (tmpProcentBorder) {
			var tmpProcentValue = ko.unwrap(tmpProcentBorder.procent);
			// Number from 0 to 100 (procents)
			if (appHelper.isNumeric(tmpProcentValue)) {
				// Convert to number
				tmpProcentValue = +tmpProcentValue;
				var tmpUsualVal = ko.unwrap(this.dict[elem.wfmParameterId]);
				if (appHelper.isNumeric(tmpUsualVal)) {
					// Convert to number
					tmpUsualVal = +tmpUsualVal;
					var tmpAveVal = ko.unwrap(this.aveDict[elem.wfmParameterId]);
					if (appHelper.isNumeric(tmpAveVal)) {
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
	};

	/**
	 * Insert or update the record
	 */
	exports.prototype.upsertMonitoringRecord = function () {
		// Check dict to numbers
		// And convert to numbers from string

		var tmpDict = ko.toJS(this.dict);

		for (var tmpKey in tmpDict) {
			if (tmpDict.hasOwnProperty(tmpKey)) {
				if (appHelper.isNumeric(tmpDict[tmpKey])) {
					tmpDict[tmpKey] = +tmpDict[tmpKey];
				} else if (!tmpDict[tmpKey]) { // check all exclude zero (zero - is number)
					tmpDict[tmpKey] = null; // set to null when empty
				} else {
					alert('Only numbers for ' + tmpKey + ': ' + tmpDict[tmpKey]);
					return;
				}
			}
		}

		this.isSaveProgress(true);

		monitoringRecordService.upsert(this.idOfWell, ko.unwrap(this.unixTime), {
			IdOfWell : this.idOfWell,
			UnixTime : ko.unwrap(this.unixTime),
			Dict : tmpDict
		}).done(this.scsUpsertMonitoringRecord.bind(this));
	};

	/**
	 * Success callback for upserting
	 */
	exports.prototype.scsUpsertMonitoringRecord = function () {
		this.isSaveProgress(false);
	};

	return exports;
});
