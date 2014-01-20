/** @module */
define(['jquery', 'helpers/ajax-request'], function ($, ajaxRequest) {
    'use strict';

    function accountLogoffUrl(uqp) {
        return '{{conf.requrl}}/api/account/logoff/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function accountLogonUrl(uqp) {
        return '{{conf.requrl}}/api/account/logon/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function accountInfoUrl() {
        return '{{conf.requrl}}/api/account/info';
    }

    /** Auth service */
    var exports = {};

    /** Account logoff */
    exports.accountLogoff = function (uqp) {
        return ajaxRequest('POST', accountLogoffUrl(uqp));
    };

    /** Account logon */
    exports.accountLogon = function (uqp, data) {
        return ajaxRequest('POST', accountLogonUrl(uqp), data);
    };

    /** Get account info */
    exports.getAccountInfo = function () {
        return ajaxRequest('GET', accountInfoUrl());
    };

    return exports;
});