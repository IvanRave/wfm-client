/** @module */
define(['jquery', 'helpers/ajax-request'], function ($, ajaxRequest) {
	'use strict';

	/**
	 * Generate url for service
	 */
	var url = function (idOfTestScope, numberOfHour) {
    var uqp = {
      testscope_id: idOfTestScope,
      hournumber: numberOfHour
    };
    
		return '//wfm-report.herokuapp.com/api/testdata' + (idOfTestScope ? ('?' + $.param(uqp)) : '');
	};

	/**
	 * Volume of well service
	 * @constructor
	 */
	var exports = {
		post : function (data) {
			return ajaxRequest('POST', url(), data);
		},
		put : function (idOfTestScope, numberOfHour, data) {
			return ajaxRequest('PUT', url(idOfTestScope, numberOfHour), data);
		},
		remove : function (idOfTestScope, numberOfHour) {
			return ajaxRequest('DELETE', url(idOfTestScope, numberOfHour));
		}
	};

	return exports;
});
