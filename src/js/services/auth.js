/** @module */
define(['jquery', 'helpers/ajax-request'], function ($, ajaxRequest) {
	'use strict';

	function accountLogoffUrl() {
		return '{{conf.requrl}}/api/account/logoff';
	}
	function accountLogonUrl() {
		return '{{conf.requrl}}/api/account/logon';
	}
	function accountInfoUrl() {
		return '{{conf.requrl}}/api/account/info';
	}

	/** Auth service */
	var exports = {};

	/** Account logoff */
	exports.accountLogoff = function () {
		return ajaxRequest('POST', accountLogoffUrl());
	};

	/** Account logon */
	exports.accountLogon = function (data) {
		return ajaxRequest('POST', accountLogonUrl(), data);
	};

	/** Get account info */
	exports.getUserProfile = function () {
		return ajaxRequest('GET', accountInfoUrl());
	};

	return exports;
});
