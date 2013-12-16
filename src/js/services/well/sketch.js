/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
    'use strict';

    function sketchOfWellUrl(idOfWell, idOfFileSpec) {
        return '{{conf.requrl}}/api/wells/' + idOfWell + '/sketches' + (idOfFileSpec ? ('/' + idOfFileSpec) : '');
    }

    var exports = {
        get: function (idOfWell, idOfFileSpec) {
            return ajaxRequest('GET', sketchOfWellUrl(idOfWell, idOfFileSpec));
        },
        put: function (idOfWell, idOfFileSpec, modelData) {
            return ajaxRequest('PUT', sketchOfWellUrl(idOfWell, idOfFileSpec), modelData);
        }
    };

    return exports;
});