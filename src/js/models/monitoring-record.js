/** @module */
define(['knockout',
		'services/monitoring-record'],
	function (ko, monitoringRecordService) {
	'use strict';

	/**
	 * Model: a monitoring record (for a well and well field monitoring section)
	 * @constructor
	 */
	var exports = function (data, mntrParams) {
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
			ths.isSaveProgress(true);
			monitoringRecordService.upsert(ths.idOfWell, ko.unwrap(ths.unixTime), {
				IdOfWell : ths.idOfWell,
				UnixTime : ko.unwrap(ths.unixTime),
				Dict : ko.toJS(ths.dict)
			}).done(function () {
				ths.isSaveProgress(false);
			});
		};

		this.dict = {}; //data.Dict;

    mntrParams.forEach(function(elem){
      ths.dict[elem.wfmParameterId] = ko.observable(data.Dict[elem.wfmParameterId]);
      ths.dict[elem.wfmParameterId].subscribe(ths.upsert);
    });
    
		// // for (var dictKey in data.Dict) {
			// // ths.dict[dictKey] = ko.observable(data.Dict[dictKey]);
			// // ths.dict[dictKey].subscribe(ths.upsert);
		// // }
    
    console.log('mntrParams', mntrParams);
	};

	return exports;
});
