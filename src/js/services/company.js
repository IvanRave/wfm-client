/** @module */
define(['jquery', 'helpers/ajax-request'], function ($, ajaxRequest) {
    'use strict';

    var companyUrl = function (uqp) {
        return '{{conf.requrl}}/api/company/' + (uqp ? ('?' + $.param(uqp)) : '');
    };

    var exports = {
        post: function (uqp, data) {
            return ajaxRequest('POST', companyUrl(uqp), data);
        },
        get: function (uqp) {
            return ajaxRequest('GET', companyUrl(uqp));
        },
        put: function (uqp, data) {
            return ajaxRequest('PUT', companyUrl(uqp), data);
        }
    };

    return exports;
});