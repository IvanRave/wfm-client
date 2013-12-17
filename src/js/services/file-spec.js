define(['jquery', 'services/datacontext', 'helpers/ajax-request'], function ($, datacontext, ajaxRequest) {
    'use strict';

    var urls = {
        company: function (idOfSection, idOfFileSpec) {
            return '{{conf.requrl}}/api/company-sections/' + idOfSection + '/file-specs' + (idOfFileSpec ? ('/' + idOfFileSpec) : '');
        },
        wegion: function (idOfSection, idOfFileSpec) {
            return '{{conf.requrl}}/api/region-sections/' + idOfSection + '/file-specs' + (idOfFileSpec ? ('/' + idOfFileSpec) : '');
        },
        /**
        * Url of file spec of section of well field
        * @param {string} idOfSection - Id of well field section (guid)
        * @param {string} idOfFileSpec - Id of file specification (guid)
        */
        wield: function (idOfSection, idOfFileSpec) {
            return '{{conf.requrl}}/api/field-sections/' + idOfSection + '/file-specs' + (idOfFileSpec ? ('/' + idOfFileSpec) : '');
        },
        wroup: function (idOfSection, idOfFileSpec) {
            return '{{conf.requrl}}/api/group-sections/' + idOfSection + '/file-specs' + (idOfFileSpec ? ('/' + idOfFileSpec) : '');
        },
        /**
        * Url of file spec of section of well
        * @param {string} idOfSection - Id of well section (guid)
        * @param {string) idOfFileSpec - Id of file spec (guid)
        */
        well: function (idOfSection, idOfFileSpec) {
            return '{{conf.requrl}}/api/well-sections/' + idOfSection + '/file-specs' + (idOfFileSpec ? ('/' + idOfFileSpec) : '');
        }
    };

    var exports = {
        // Get url for posting new file
        getUrl: function (typeOfStage, idOfSection, idOfFileSpec) {
            return urls[typeOfStage](idOfSection, idOfFileSpec);
        },
        get: function (typeOfStage, idOfSection) {
            return ajaxRequest('GET', urls[typeOfStage](idOfSection));
        },
        // Delete few files in one request
        deleteArray: function (typeOfStage, idOfSection, listOfFileSpec) {
            return ajaxRequest('DELETE', urls[typeOfStage](idOfSection), listOfFileSpec);
        }
    };

    return exports;
});