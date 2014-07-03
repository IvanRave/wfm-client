/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
	'use strict';

	var reportUrl = function () {
		return '//wfm-report.herokuapp.com/api/report';
	};

	/**
	 * A report service static methods
	 */
	var exports = {
		post : function (idOfWidgout, nameOfReport) {
			return ajaxRequest('POST', reportUrl(), {
				idOfWidgout : idOfWidgout,
				nameOfReport : nameOfReport
				// desc, other data
			});
		}
	};

	return exports;
});
