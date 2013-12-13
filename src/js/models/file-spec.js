/** @module */
define(['knockout', 'moment'], function (ko, appMoment) {
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

        /**
        * File creation datetime, unix timestamp, in seconds
        * @type {number}
        */
        this.createdUnixTime = data.CreatedUnixTime;

        /**
        * File size, bytes,
        * @type {number}
        */
        this.length = data.Length;

        /**
        * File size, kilobytes
        * @type {number}
        */
        this.lengthInKb = parseInt(this.length / 1024, 10);

        /**
        * Full file decription for files on small screen
        * @type {string}
        */
        this.fullTitle = 'Size: ' + this.length +
            ' bytes\nExtension: ' + this.extension +
            '\nCreated: ' + appMoment(ko.unwrap(this.createdUnixTime) * 1000).format('YYYY-MM-DD HH:mm:ss');

        /**
        * Whether file is selected (in file manager)
        * @type {boolean}
        */
        this.isSelected = ko.observable();

        /////** Convert to plain object: without ko bindings and only needed properties */
        ////this.toPlainJson = function () {
        ////    return {
        ////        id: this.id
        ////    };
        ////};
    };

    return exports;
});