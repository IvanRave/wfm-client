/** @module */
define(['helpers/ajax-request', 'constants/stage-constants'], function (ajaxRequest, stageConstants) {
    'use strict';

    /** Generate url for widget layout service */
    var url = function (stageKey, idOfWidgock, idOfWidget) {
        if (!stageConstants[stageKey]) { throw new ReferenceError('No such key for stage constants: ' + stageKey); }
        return '//wfm-report.herokuapp.com/api/' + stageConstants[stageKey].plural + '/widget-blocks/' + idOfWidgock + '/widgets' + (idOfWidget ? ('/' + idOfWidget) : '');
    };

    /**
    * Widget service
    * @constructor
    */
    var exports = {
        get: function (stageKey, idOfWidgock, idOfWidget) {
            return ajaxRequest('GET', url(stageKey, idOfWidgock, idOfWidget));
        },
        post: function (stageKey, idOfWidgock, widgetData) {
            return ajaxRequest('POST', url(stageKey, idOfWidgock), widgetData);
        },
        put: function (stageKey, idOfWidgock, idOfWidget, widgetData) {
            return ajaxRequest('PUT', url(stageKey, idOfWidgock, idOfWidget), widgetData);
        },
        remove: function (stageKey, idOfWidgock, idOfWidget) {
            return ajaxRequest('DELETE', url(stageKey, idOfWidgock, idOfWidget));
        }
    };

    return exports;
});