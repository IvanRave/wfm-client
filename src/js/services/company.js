/** @module */
define(['jquery', 'helpers/ajax-request'], function ($, ajaxRequest) {
    'use strict';

    var companyUrl = function (companyId) {
        return '{{conf.requrl}}/api/company/' + (companyId ? ('?' + $.param({ id: companyId })) : '');
    };

    /**
    * Company service
    * @constructor
    */
    var exports = {
        post: function (data) {
            return ajaxRequest('POST', companyUrl(), data);
        },
        get: function () {
            return ajaxRequest('GET', companyUrl());
        },
        put: function (companyId, data) {
            return ajaxRequest('PUT', companyUrl(companyId), data);
        },
        remove: function (companyId) {
            return ajaxRequest('DELETE', companyUrl(companyId));
        }
    };

    return exports;
});