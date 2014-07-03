/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
    'use strict';

    /**
    * Generate url for service
    * @param {number} idOfWell - Id of parent (well)
    * @param {string} id - Id of this log: guid
    */
    var url = function (idOfWell, id) {
        return '//wfm-report.herokuapp.com/api/wells/' + idOfWell + '/logs' + (id ? ('/' + id) : '');
    };

    /**
    * Data service: log of well
    * @constructor
    */
    var exports = {
        get: function (idOfWell, id) {
            return ajaxRequest('GET', url(idOfWell, id));
        },
        getUrl: function (idOfWell, id) {
            return url(idOfWell, id);
        },
        post: function (idOfWell, data) {
            return ajaxRequest('POST', url(idOfWell), data);
        },
        put: function (idOfWell, id, data) {
            return ajaxRequest('PUT', url(idOfWell, id), data);
        },
        remove: function (idOfWell, id) {
            return ajaxRequest('DELETE', url(idOfWell, id));
        }
    };

    return exports;
});