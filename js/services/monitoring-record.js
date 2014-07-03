/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
	'use strict';

	/**
	 * Generate url for service
	 */
	var url = function (idOfWell, unixTime) {
		return '//wfm-report.herokuapp.com/api/wells/' + idOfWell + '/monitoring-records' + (unixTime ? ('/' + unixTime) : '');
	};

	/**
	 * Generate url to getting filtered data
	 */
	var urlForFilteredData = function (idOfWell, startUnixTime, endUnixTime) {
		return '//wfm-report.herokuapp.com/api/wells/' + idOfWell + '/monitoring-records/time-start/' + startUnixTime + '/time-end/' + endUnixTime;
	};

	/**
	 * Url to get data for all wells
	 */
	var urlForListOfScope = function (idOfWroup, unixTime) {
		return '//wfm-report.herokuapp.com/api/well-groups/' + idOfWroup + '/wells/all/monitoring-records/' + unixTime;
	};

	/**
	 * Volume of well service
	 * @constructor
	 */
	var exports = {
		getListOfScope : function (idOfWroup, unixTime) {
			return ajaxRequest('GET', urlForListOfScope(idOfWroup, unixTime));
		},
    getFilteredData: function(idOfWell, startUnixTime, endUnixTime){
      return ajaxRequest('GET', urlForFilteredData(idOfWell, startUnixTime, endUnixTime));
    },
		upsert : function (idOfWell, unixTime, mdlData) {
			return ajaxRequest('POST', url(idOfWell, unixTime), mdlData);
		},
    removeAll : function(idOfWell){
      return ajaxRequest('DELETE', url(idOfWell));
    },
		remove : function (idOfWell, unixTime) {
			return ajaxRequest('DELETE', url(idOfWell, unixTime));
		}
	};

	return exports;
});
