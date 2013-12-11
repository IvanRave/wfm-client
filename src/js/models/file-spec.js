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
        this.id = data.Id;

        /**
        * File name (255)
        * @type {string}
        */
        this.name = ko.observable(data.Name);

        /**
        * File extension
        * @type {string}
        */
        this.extension = data.Extension;

        /**
        * Content type
        * @type {string}
        */
        this.contentType = data.ContentType;

        // TODO: add other properties
    };

    return exports;
});