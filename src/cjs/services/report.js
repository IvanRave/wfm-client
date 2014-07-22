/** @module services/report */

'use strict';

var ajaxRequest = require('helpers/ajax-request');

var reportUrl = function () {
	return '{{conf.requrl}}/api/report';
};

/**
 * A report service static methods
 */
exports = {
	post : function (idOfWidgout, nameOfReport) {
		return ajaxRequest('POST', reportUrl(), {
			idOfWidgout : idOfWidgout,
			nameOfReport : nameOfReport
			// desc, other data
		});
	}
};

module.exports = exports;
