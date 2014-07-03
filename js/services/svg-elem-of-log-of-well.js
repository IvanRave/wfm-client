/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
    'use strict';

    /**
    * Generate url for service
    * @param {number} idOfLogOfWell - Id of parent (log of well)
    * @param {string} id - Id of this figure: guid
    */
    var url = function (idOfLogOfWell, id) {
        return '//wfm-report.herokuapp.com/api/well-logs/' + idOfLogOfWell + '/svg-elements' + (id ? ('/' + id) : '');
    };

    /**
    * Data service: img figure of log of well
    * @constructor
    */
    var exports = {
        get: function (idOfLogOfWell, id) {
            return ajaxRequest('GET', url(idOfLogOfWell, id));
        },
        ////getUrl: function (idOfWell, id) {
        ////    return url(idOfWell, id);
        ////},
        post: function (idOfLogOfWell, data) {
            return ajaxRequest('POST', url(idOfLogOfWell), data);
        },
        ////put: function (idOfWell, id, data) {
        ////    return ajaxRequest('PUT', url(idOfWell, id), data);
        ////},
        remove: function (idOfLogOfWell, id) {
            return ajaxRequest('DELETE', url(idOfLogOfWell, id));
        }
    };

    return exports;
});