define(['jquery', 'services/datacontext', 'helpers/ajax-request'], function ($, datacontext, ajaxRequest) {
    'use strict';

    function accountLogoffUrl(uqp) {
        return 'http://wfm-client.azurewebsites.net/api/account/logoff/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function accountLogonUrl(uqp) {
        return 'http://wfm-client.azurewebsites.net/api/account/logon/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function accountInfoUrl() {
        return 'http://wfm-client.azurewebsites.net/api/account/info';
    }

    // Account logoff
    datacontext.accountLogoff = function (uqp) {
        return ajaxRequest('POST', accountLogoffUrl(uqp));
    };

    // Account logon
    datacontext.accountLogon = function (uqp, data) {
        return ajaxRequest('POST', accountLogonUrl(uqp), data);
    };

    /** Get account info */
    datacontext.getAccountInfo = function () {
        return ajaxRequest('GET', accountInfoUrl());
    };
});