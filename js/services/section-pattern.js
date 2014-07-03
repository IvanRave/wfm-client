/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
	'use strict';

	/**
	 * Generate url for service
	 */
	var url = function () {
		return '//wfm-report.herokuapp.com/api/section-patterns';
	};

	/**
	 * Data service: section patterns
	 * @constructor
	 */
	var exports = {
		get : function () {
			return ajaxRequest('GET', url());
		}
	};

	return exports;
});