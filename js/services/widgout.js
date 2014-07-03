/** @module */
define(['helpers/ajax-request', 'constants/stage-constants'], function (ajaxRequest, stageConstants) {
    'use strict';

    var widgoutTemplates = [{
        name: '1 (one column)',
        widgockDtoList: [{
            orderNumber: 1,
            columnCount: 12
        }]
    },
    {
        name: '1-1 (two columns)',
        widgockDtoList: [{
            orderNumber: 1,
            columnCount: 6
        },
        {
            orderNumber: 2,
            columnCount: 6
        }]
    },
    {
        name: '1-1-1 (three columns)',
        widgockDtoList: [{
            orderNumber: 1,
            columnCount: 4
        },
        {
            orderNumber: 2,
            columnCount: 4
        },
        {
            orderNumber: 3,
            columnCount: 4
        }]
    },
   {
       name: '1-2 (two columns)',
       widgockDtoList: [{
           orderNumber: 1,
           columnCount: 4
       },
       {
           orderNumber: 2,
           columnCount: 8
       }]
   },
   {
       name: '2-1 (two columns)',
       widgockDtoList: [{
           orderNumber: 1,
           columnCount: 8
       },
       {
           orderNumber: 2,
           columnCount: 4
       }]
   },
   {
       name: '1-1-1-1 (four columns)',
       widgockDtoList: [{
           orderNumber: 1,
           columnCount: 3
       },
       {
           orderNumber: 2,
           columnCount: 3
       },
       {
           orderNumber: 3,
           columnCount: 3
       },
       {
           orderNumber: 4,
           columnCount: 3
       }]
   },
   {
       name: '1-1-2 (three columns)',
       widgockDtoList: [{
           orderNumber: 1,
           columnCount: 3
       },
       {
           orderNumber: 2,
           columnCount: 3
       },
       {
           orderNumber: 3,
           columnCount: 6
       }]
   },
   {
       name: '1-2-1 (three columns)',
       widgockDtoList: [{
           orderNumber: 1,
           columnCount: 3
       },
       {
           orderNumber: 2,
           columnCount: 6
       },
       {
           orderNumber: 3,
           columnCount: 3
       }]
   },
   {
       name: '2-1-1 (three columns)',
       widgockDtoList: [{
           orderNumber: 1,
           columnCount: 6
       },
       {
           orderNumber: 2,
           columnCount: 3
       },
       {
           orderNumber: 3,
           columnCount: 3
       }]
   },
   {
       name: '3-1 (two columns)',
       widgockDtoList: [{
           orderNumber: 1,
           columnCount: 9
       },
       {
           orderNumber: 2,
           columnCount: 3
       }]
   },
   {
       name: '1-3 (two columns)',
       widgockDtoList: [{
           orderNumber: 1,
           columnCount: 3
       },
       {
           orderNumber: 2,
           columnCount: 9
       }]
   }];

    /** Generate url for widget layout service */
    var url = function (stageKey, stageId, widgoutId) {
        if (!stageConstants[stageKey]) { throw new ReferenceError('No such key for stage constants: ' + stageKey); }
        return '//wfm-report.herokuapp.com/api/' + stageConstants[stageKey].plural + '/' + stageId + '/widget-layouts' + (widgoutId ? ('/' + widgoutId) : '');
    };

    /**
    * Widget layout service
    * @constructor
    */
    var exports = {
        get: function (stageKey, stageId, widgoutId) {
            return ajaxRequest('GET', url(stageKey, stageId, widgoutId));
        },
        post: function (stageKey, stageId, widgoutData) {
            return ajaxRequest('POST', url(stageKey, stageId), widgoutData);
        },
        put: function (stageKey, stageId, widgoutId, widgoutData) {
            return ajaxRequest('PUT', url(stageKey, stageId, widgoutId), widgoutData);
        },
        remove: function (stageKey, stageId, widgoutId) {
            return ajaxRequest('DELETE', url(stageKey, stageId, widgoutId));
        },
        /** May be changed to server realization */
        getWidgoutTemplates: function () {
            return widgoutTemplates;
        }
    };

    return exports;
});