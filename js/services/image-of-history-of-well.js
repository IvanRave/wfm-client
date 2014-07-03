/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
    'use strict';

    /** Url */
    var url = function (idOfHistoryOfWell, id) {
        return '//wfm-report.herokuapp.com/api/well-histories/' + idOfHistoryOfWell + '/history-images' + (id ? ('/' + id) : '');
    };

    /**
    * Service: cropped image (xerox) of history of well
    * @constructor
    */
    var exports = {
        get: function (idOfHistoryOfWell, id) {
            return ajaxRequest('GET', url(idOfHistoryOfWell, id));
        },
        post: function (idOfHistoryOfWell, data) {
            return ajaxRequest('POST', url(idOfHistoryOfWell), data);
        },
        remove: function (idOfHistoryOfWell, id) {
            return ajaxRequest('DELETE', url(idOfHistoryOfWell, id));
        }
    };

    return exports;
});