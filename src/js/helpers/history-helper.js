/** @module */
define([], function () {
    'use strict';

    var historyHelper = {};

    ////var routes = [
    ////        { url: '/companies' },
    ////        { url: '/companies/{companyId:guid}/well-regions' },
    ////        { url: '/companies/{companyId:guid}/well-regions/{wegionId:int}' },
    ////        { url: '/account/logon' }, // may be with some query params, like redirectUrl
    ////        { url: '/account/register' }
    ////];

    /**
    * Returns initial data from hash: companyId, wellId, etc.
    * @param {string} str - Hash string: companies/123/well-regions/2334/well-fields
    * @returns {object} - Initial data
    */
    historyHelper.getInitialData = function (str) {
        var initialData = {};

        // TODO: make from routes
        if (str.length > 1) {
            var paramArr = str.split('/');
            if (paramArr[1] === 'companies') {
                if (paramArr[2]) {
                    initialData.companyId = paramArr[2];
                    if (paramArr[3] === 'well-regions') {
                        if (paramArr[4]) {
                            initialData.wegionId = parseInt(paramArr[4], 10);
                            if (paramArr[5] === 'well-fields') {
                                if (paramArr[6]) {
                                    initialData.wieldId = parseInt(paramArr[6], 10);
                                }
                            }
                            else if (paramArr[5] === 'sections') {
                                if (paramArr[6]) {
                                    initialData.wegionSectionId = paramArr[6];
                                }
                            }
                        }
                    }
                }
            }
        }

        return initialData;
    };

    historyHelper.pushState = function (url) {
        if (history.pushState) {
            history.pushState({}, '', '#' + url);
        }
    };

    return historyHelper;
});