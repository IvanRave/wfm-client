/** @module services/auth */

'use strict';

var ajaxRequest = require('helpers/ajax-request');

function sessionUrl(code) {
	return '{{conf.requrl}}/api/account/session' +
	'?code=' + code +
	'&client_id=' + '{{conf.idOfAuthClient}}' +
	'&redirect_uri=' + encodeURIComponent('{{conf.redirectUriOfAuthClient}}');
}

/** Auth service */
exports = {};

/** Create an access token */
exports.buildSession = function (code) {
	return ajaxRequest('POST', sessionUrl(code));
};

module.exports = exports;
