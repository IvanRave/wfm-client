/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /**
    * File specification
    * @param {object} data - File specification data
    * @constructor
    */
    var exports = function (data) {
        data = data || {};

        /**
        * File guid
        * @type {string}
        */
        this.Id = data.Id;

        /**
        * File name (255)
        * @type {string}
        */
        this.Name = ko.observable(data.Name);

        /**
        * File extension
        * @type {string}
        */
        this.Extension = data.Extension;

        /**
        * Content type
        * @type {string}
        */
        this.ContentType = data.ContentType;

        // TODO: add other properties
    };

    return exports;
});