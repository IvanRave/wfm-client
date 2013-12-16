define(['helpers/ajax-request'], function (ajaxRequest) {
    'use strict';

    function volumeOfWellUrl(idOfWell, idOfFileSpec) {
        return '{{conf.requrl}}/api/wells/' + idOfWell + '/volumes' + (idOfFileSpec ? ('/' + idOfFileSpec) : '');
    }

    var exports = {
        getVolumeOfWell: function (idOfWell, idOfFileSpec) {
            return ajaxRequest('GET', volumeOfWellUrl(idOfWell, idOfFileSpec));
        }
    };

    return exports;
});