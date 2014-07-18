define(function (require, exports, module) {
/** @module services/auth */

'use strict';

var ajaxRequest = require('helpers/ajax-request');

function sessionUrl() {
	return '//wfm-report.herokuapp.com/api/account/session';
}

/** Auth service */
exports = {};

/** Get account info */
exports.buildSession = function (code) {
	var dataStr = 'code=' + code + '&client_id=' + 'wfm-client' + '&redirect_uri=' + '//ivanrave.github.io/wfm-client/handle-auth-code.html';
	return ajaxRequest('POST', sessionUrl(), dataStr, 'application/x-www-form-urlencoded; charset=UTF-8');
};

module.exports = exports;

});