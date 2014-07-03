/** @module */
define(['jquery', 'helpers/ajax-request'], function ($, ajaxRequest) {
    'use strict';

    var url = function (uqp) {
        return '//wfm-report.herokuapp.com/api/wellfield/' + (uqp ? ('?' + $.param(uqp)) : '');
    };

    /**
    * Data service
    * @constructor
    */
    var exports = {
        get: function () {
            return ajaxRequest('GET', url());
        },
        post: function (data) {
            return ajaxRequest('POST', url(), data);
        },
        put: function (id, data) {
            return ajaxRequest('PUT', url({ id: id }), data);
        },
        remove: function (id) {
            return ajaxRequest('DELETE', url({ id: id }));
        }
    };

    return exports;
});