/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
    'use strict';

    function companyUserUrl() {
        return '{{conf.requrl}}/api/companyuser';
    }

    /**
    * Company user service
    * @constructor
    */
    var exports = {
        getCompanyUserList: function () {
            return ajaxRequest('GET', companyUserUrl());
        }
    };

    return exports;
});