define(function (require, exports, module) {
/** @module services/auth */

'use strict';

var ajaxRequest = require('helpers/ajax-request');

function sessionUrl(code) {
	return '//wfm-report.herokuapp.com/api/account/session' +
	'?code=' + code +
	'&client_id=' + 'wfm-client' +
	'&redirect_uri=' + encodeURIComponent('//ivanrave.github.io/wfm-client/handle-auth-code.html');
}

/** Auth service */
exports = {};

/** Create an access token */
exports.buildSession = function (code) {
	return ajaxRequest('POST', sessionUrl(code));
};

module.exports = exports;

});