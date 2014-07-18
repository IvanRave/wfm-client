/** @module services/auth */

'use strict';

var ajaxRequest = require('helpers/ajax-request');

function sessionUrl() {
	return '{{conf.requrl}}/api/account/session';
}

/** Auth service */
exports = {};

/** Get account info */
exports.buildSession = function (code) {
	var dataStr = 'code=' + code + '&client_id=' + '{{conf.idOfAuthClient}}' + '&redirect_uri=' + '{{conf.redirectUriOfAuthClient}}';
	return ajaxRequest('POST', sessionUrl(), dataStr, 'application/x-www-form-urlencoded; charset=UTF-8');
};

module.exports = exports;
