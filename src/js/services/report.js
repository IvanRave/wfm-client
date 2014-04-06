/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
	'use strict';

	var reportUrl = function () {
		return '{{conf.wfmNodeUrl}}/api/report';
	};

	/**
	 * A report service static methods
	 */
	var exports = {
		post : function (idOfWidgout) {
			return ajaxRequest('POST', reportUrl(), {
				'idOfWidgout' : idOfWidgout
				// .. name, desc, other data
			});
		}
	};

	return exports;
});
