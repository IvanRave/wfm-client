/** @module */
define(['jquery', 'helpers/ajax-request'], function ($, ajaxRequest) {
	'use strict';
	
	function accountInfoUrl() {
		return '{{conf.requrl}}/api/account/info';
	}

	/** Auth service */
	var exports = {};

	/** Get account info */
	exports.getUserProfile = function () {
		return ajaxRequest('GET', accountInfoUrl());
	};

	return exports;
});
