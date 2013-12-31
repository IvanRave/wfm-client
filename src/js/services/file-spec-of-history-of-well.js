/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
    'use strict';

    /** Url */
    var url = function (idOfHistoryOfWell, idOfFileSpec) {
        return '{{conf.requrl}}/api/well-history/' + idOfHistoryOfWell + '/history-files' + (idOfFileSpec ? ('/' + idOfFileSpec) : '');
    };

    /**
    * Service: file specification of history of well
    * @constructor
    */
    var exports = {
        get: function (idOfHistoryOfWell, idOfFileSpec) {
            return ajaxRequest('GET', url(idOfHistoryOfWell, idOfFileSpec));
        },
        post: function (idOfHistoryOfWell, data) {
            return ajaxRequest('POST', url(idOfHistoryOfWell), data);
        },
        ////put: function (idOfHistoryOfWell, idOfFileSpec, data) {
        ////    return ajaxRequest('PUT', url(idOfHistoryOfWell, idOfFileSpec), data);
        ////},
        remove: function (idOfHistoryOfWell, idOfFileSpec) {
            return ajaxRequest('DELETE', url(idOfHistoryOfWell, idOfFileSpec));
        }
    };

    return exports;
});