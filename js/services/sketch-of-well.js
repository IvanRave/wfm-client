/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
    'use strict';

    function sketchOfWellUrl(idOfWell) {
        return '//wfm-report.herokuapp.com/api/wells/' + idOfWell + '/sketches';
    }

    var exports = {
        get: function (idOfWell) {
            return ajaxRequest('GET', sketchOfWellUrl(idOfWell));
        },
        put: function (idOfWell, modelData) {
            return ajaxRequest('PUT', sketchOfWellUrl(idOfWell), modelData);
        },
        remove: function (idOfWell) {
            return ajaxRequest('DELETE', sketchOfWellUrl(idOfWell));
        }
    };

    return exports;
});