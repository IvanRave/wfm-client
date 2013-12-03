﻿define(['jquery', 'services/datacontext', 'helpers/ajax-request'], function ($, datacontext, ajaxRequest) {
    'use strict';

    function accountRegisterUrl(uqp) {
        return '{{conf.requrl}}/api/account/register/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function accountRegisterConfirmationUrl(uqp) {
        return '{{conf.requrl}}/api/account/register/confirmation/' + (uqp ? ('?' + $.param(uqp)) : '');
    }

    // Account register
    datacontext.accountRegister = function (uqp, data) {
        return ajaxRequest('POST', accountRegisterUrl(uqp), data);
    };

    // Confirm email after registration
    datacontext.accountRegisterConfirmation = function (uqp, data) {
        return ajaxRequest('POST', accountRegisterConfirmationUrl(uqp), data);
    };
});