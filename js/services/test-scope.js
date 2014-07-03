/** @module */
define(['jquery', 'helpers/ajax-request'], function ($, ajaxRequest) {
	'use strict';

	/**
	 * Generate url for service
	 */
	var url = function (uqp) {
		return '//wfm-report.herokuapp.com/api/testscope/' + (uqp ? ('?' + $.param(uqp)) : '');
	};

	/**
	 * Volume of well service
	 * @constructor
	 */
	var exports = {
		get : function (idOfWell) {
			return ajaxRequest('GET', url({
					well_id : idOfWell
				}));
		},
		post : function (data) {
			return ajaxRequest('POST', url(), data);
		},
		put : function (idOfTestScope, data) {
			return ajaxRequest('PUT', url({
					id : idOfTestScope
				}), data);
		}
	};

	return exports;
});
