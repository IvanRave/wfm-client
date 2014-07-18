﻿/** @module services/auth */

'use strict';

var ajaxRequest = require('helpers/ajax-request');

function accountInfoUrl() {
	return '{{conf.requrl}}/api/account/info';
}

function accountLogOffUrl() {
	return '{{conf.requrl}}/api/account/logoff';
}

/** Auth service */
exports = {};

/** Get account info */
exports.getUserProfile = function () {
	return ajaxRequest('GET', accountInfoUrl());
};

/** End the session */
exports.accountLogOff = function () {
	return ajaxRequest('GET', accountLogOffUrl());
};

module.exports = exports;
