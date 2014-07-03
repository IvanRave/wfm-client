/** @module */
define(['jquery', 'helpers/ajax-request'], function ($, ajaxRequest) {
    'use strict';

    var companyUrl = function (companyId) {
        return '//wfm-report.herokuapp.com/api/company/' + (companyId ? ('?' + $.param({ id: companyId })) : '');
    };

    /**
    * Company service
    * @constructor
    */
    var exports = {
        get: function () {
            return ajaxRequest('GET', companyUrl());
        },
        post: function (data) {
            return ajaxRequest('POST', companyUrl(), data);
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