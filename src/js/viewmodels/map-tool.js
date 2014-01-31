/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /**
    * Viewmodel: map tool, like 'marker', 'ruler', 'scale', 'route', etc.
    * @constructor
    */
    var exports = function (data, koIdOfSlcVwmMapTool) {
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
        * Whether tool allow to edit any info
        * @type {boolean}
        */
        this.isPublicTool = data.isPublicTool;

        /**
        * Whether tool is selected
        * @type {boolean}
        */
        this.isSlc = ko.computed({
            read: function () {
                return ths.id === ko.unwrap(koIdOfSlcVwmMapTool);
            },
            deferEvaluation: true
        });
    };

    return exports;
});