/** @module */
define([], function () {
    'use strict';

    /**
    * Section pattern
    * @constructor
    * @param {object} data - Pattern data
    */
    var exports = function (data) {
        data = data || {};

        /**
        * Pattern id, like 'well-summary', 'wroup-map'
        * @type {string}
        */
        this.id = data.Id;

        /**
        * Section default name
        * @type {string}
        */
        this.name = data.Name;

        /**
        * A css class for the section pattern
        * @type {string}
        */
        this.iconClass = this.id + '-icon';
        
        /**
        * Id of stage: 'well', 'wroup' etc
        * @type {string}
        */
        this.idOfStage = data.IdOfStage;

        /**
        * Allowed file types regular expression (to upload through a file manager)
        * @type {string}
        */
        this.fileTypeRegExp = data.FileFormatRegExp;

        // All below props can be changed only using admin panel
        /**
        * Is view
        * @type {boolean}
        */
        this.isView = data.IsView;

        /**
        * Whether section is showed in a file manager
        * @type {boolean}
        */
        this.isFolder = data.IsFolder;

        /**
        * Whether section is widget on a dashboard
        * @type {boolean}
        */
        this.isWidget = data.IsWidget;
    };

    return exports;
});