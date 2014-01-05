/** @module */
define(['constants/stage-constants', 'helpers/ajax-request'], function (stageConstants, ajaxRequest) {
    'use strict';

    /** Generate url */
    var url = function (typeOfStage, idOfSection, idOfFileSpec) {
        var stagePlural = stageConstants[typeOfStage].plural;
        return '{{conf.requrl}}/api/' + stagePlural + '/sections/' + idOfSection + '/file-specs' + (idOfFileSpec ? ('/' + idOfFileSpec) : '');
    };

    /**
    * File spec service
    * @constructor
    */
    var exports = {
        // Get url for posting new file
        getUrl: function (typeOfStage, idOfSection, idOfFileSpec) {
            return url(typeOfStage, idOfSection, idOfFileSpec);
        },
        get: function (typeOfStage, idOfSection) {
            return ajaxRequest('GET', url(typeOfStage, idOfSection));
        },
        // Delete few files in one request
        deleteArray: function (typeOfStage, idOfSection, listOfFileSpec) {
            return ajaxRequest('DELETE', url(typeOfStage, idOfSection), listOfFileSpec);
        }
    };

    return exports;
});