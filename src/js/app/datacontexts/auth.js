﻿define(['jquery', 'app/datacontext', 'app/ajax-request'], function ($, datacontext, ajaxRequest) {
    'use strict';

    function accountLogoffUrl(uqp) {
        return '{{conf.requrl}}/api/account/logoff/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function accountLogonUrl(uqp) {
        return '{{conf.requrl}}/api/account/logon/' + (uqp ? ('?' + $.param(uqp)) : '');
    }

    // Account logoff
    datacontext.accountLogoff = function (uqp) {
        return ajaxRequest('POST', accountLogoffUrl(uqp));
    };

    // Account logon
    datacontext.accountLogon = function (uqp, data) {
        return ajaxRequest('POST', accountLogonUrl(uqp), data);
    };
});