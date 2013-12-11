define(['jquery', 'services/datacontext', 'helpers/ajax-request'], function ($, datacontext, ajaxRequest) {
    'use strict';

    var urls = {
        /**
        * Url of file spec of section of well field
        * @param {string} idOfSection - Id of well field section (guid)
        * @param {string} idOfFileSpec - Id of file specification (guid)
        */
        wield: function (idOfSection, idOfFileSpec) {
            return '{{conf.requrl}}/api/field-sections/' + idOfSection + '/file-specs' + (idOfFileSpec ? ('/' + idOfFileSpec) : '');
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
        well: {
            getUrl: function (idOfSection, idOfFileSpec) {
                return urls.well(idOfSection, idOfFileSpec);
            }
        },
        wroup: {},
        wield: {
            // For file uploader
            getUrl: function (idOfSection, idOfFileSpec) {
                return urls.wield(idOfSection, idOfFileSpec);
            },
            get: function (idOfSection) {
                return ajaxRequest('GET', urls.wield(idOfSection));
            }
        },
        wegion: {},
        company: {}
    };

    return exports;
});