/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
    'use strict';

    function companyUserUrl() {
        return '//wfm-report.herokuapp.com/api/companyuser';
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