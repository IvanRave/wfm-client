/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
	'use strict';

	/**
	 * Generate url for service
	 * @param {bool} isInclusive - Whether include child parameters
	 */
	var url = function (isInclusive) {
		return '{{conf.requrl}}/api/wfm-param-squads' + (isInclusive ? '/inclusive' : '');
	};

	/**
	 * Data service: parameter squads
	 * @constructor
	 */
	var exports = {
		get : function () {
			return ajaxRequest('GET', url());
      // return ['rate', 'cumulative', 'watercut', 'gor', etc.];
		},
		getInclusive : function () {
			return ajaxRequest('GET', url(true));
		}
	};

	return exports;
});