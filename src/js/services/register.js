/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
    'use strict';

    function accountRegisterUrl() {
        return '{{conf.requrl}}/api/account/register';
    }

    function accountRegisterConfirmationUrl() {
        return '{{conf.requrl}}/api/account/register/confirmation';
    }

    /**
    * Register service
    * @constructor
    */
    var exports = {
        // Account register
        accountRegister: function (data) {
            return ajaxRequest('POST', accountRegisterUrl(), data);
        },
        // Confirm email after registration
        accountRegisterConfirmation: function (data) {
            return ajaxRequest('POST', accountRegisterConfirmationUrl(), data);
        }
    };

    return exports;
});