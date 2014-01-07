/** @module */
define(['constants/stage-constants', 'helpers/ajax-request'], function (stageConstants, ajaxRequest) {
    'use strict';

    /** Generate url */
    var url = function (stageKey, idOfSection, idOfFileSpec) {
        var stagePlural = stageConstants[stageKey].plural;
        return '{{conf.requrl}}/api/' + stagePlural + '/sections/' + idOfSection + '/file-specs' + (idOfFileSpec ? ('/' + idOfFileSpec) : '');
    };

    /**
    * File spec service
    * @constructor
    */
    var exports = {
        // Get url for posting new file
        getUrl: function (stageKey, idOfSection, idOfFileSpec) {
            return url(stageKey, idOfSection, idOfFileSpec);
        },
        get: function (stageKey, idOfSection) {
            return ajaxRequest('GET', url(stageKey, idOfSection));
        },
        getColumnAttributes: function(stageKey, idOfSection, idOfFileSpec){
            return ajaxRequest('GET', url(stageKey, idOfSection, idOfFileSpec) + '/column-attributes');
        },
        // Delete few files in one request
        deleteArray: function (stageKey, idOfSection, listOfFileSpec) {
            return ajaxRequest('DELETE', url(stageKey, idOfSection), listOfFileSpec);
        }
    };

    return exports;
});