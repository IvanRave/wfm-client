/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
    'use strict';

    /**
    * Generate url for service
    * @param {number} idOfMapOfWield - Id of parent (map of well field)
    * @param {number} idOfWell - Id of well
    */
    var url = function (idOfMapOfWield, idOfWell) {
        return '{{conf.requrl}}/api/well-fields/maps/' + idOfMapOfWield + '/well-markers' + (idOfWell ? ('/' + idOfWell) : '');
    };

    /**
    * Data service: well marker of map of field
    * @constructor
    */
    var exports = {
        get: function (idOfMapOfWield, idOfWell) {
            return ajaxRequest('GET', url(idOfMapOfWield, idOfWell));
        },
        post: function (idOfMapOfWield, data) {
            return ajaxRequest('POST', url(idOfMapOfWield), data);
        },
        put: function (idOfMapOfWield, idOfWell, data) {
            return ajaxRequest('PUT', url(idOfMapOfWield, idOfWell), data);
        },
        remove: function (idOfMapOfWield, idOfWell) {
            return ajaxRequest('DELETE', url(idOfMapOfWield, idOfWell));
        }
    };

    return exports;
});