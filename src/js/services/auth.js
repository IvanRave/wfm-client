/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
	'use strict';
	
	function accountInfoUrl() {
		return '{{conf.requrl}}/api/account/info';
	}
  
  function accountLogOffUrl() {
		return '{{conf.requrl}}/api/account/logoff';
	}

	/** Auth service */
	var exports = {};

	/** Get account info */
	exports.getUserProfile = function () {
		return ajaxRequest('GET', accountInfoUrl());
	};
  
  /** End the session */
  exports.accountLogOff = function() {
    return ajaxRequest('GET', accountLogOffUrl());
  };

	return exports;
});
