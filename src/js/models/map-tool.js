/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /**
    * Map tool, like 'marker', 'ruler', 'scale', 'route', etc.
    * @constructor
    */
    var exports = function (data, koIdOfSlcMapTool) {
        data = data || {};

        var ths = this;

        /**
        * Tool id: for system
        * @type {string}
        */
        this.id = data.id;
        
        /**
        * Tool name: name can be different of using, f.e. in Well-map marker-tool name = 'Well marker'
        * @type {string}
        */
        this.name = data.name;

        /**
        * Tool icon
        * @type {string}
        */
        this.icon = data.icon;

        /**
        * Whether tool is selected
        * @type {boolean}
        */
        this.isSlc = ko.computed({
            read: function () {
                return ths === ko.unwrap(koIdOfSlcMapTool);
            },
            deferEvaluation: true
        });
    };

    return exports;
});