/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
    'use strict';

    /**
    * Generate url for service
    * @param {number} idOfWield - Id of parent (well field)
    * @param {number} id - Id of this map
    */
    var url = function (idOfWield, id) {
        return '{{conf.requrl}}/api/well-fields/' + idOfWield + '/maps' + (id ? ('/' + id) : '');
    };

    /**
    * Data service: map of field
    * @constructor
    */
    var exports = {
        get: function (idOfWield, id) {
            return ajaxRequest('GET', url(idOfWield, id));
        },
        ////getUrl: function (idOfWield, id) {
        ////    return url(idOfWield, id);
        ////},
        post: function (idOfWield, data) {
            return ajaxRequest('POST', url(idOfWield), data);
        },
        put: function (idOfWield, id, data) {
            return ajaxRequest('PUT', url(idOfWield, id), data);
        },
        remove: function (idOfWield, id) {
            return ajaxRequest('DELETE', url(idOfWield, id));
        }
    };

    return exports;
});