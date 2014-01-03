/** @module */
define(['knockout', 'moment', 'helpers/app-helper'], function (ko, appMoment, appHelper) {
    'use strict';

    /**
    * File specification
    * @param {object} data - File specification data
    * @constructor
    */
    var exports = function (data) {
        data = data || {};

        /** Alternative */
        var ths = this;

        /**
        * File guid
        * @type {string}
        */
        this.id = data.Id;

        /**
        * File url: generating on the server
        * @type {string}
        */
        this.fileUrl = data.FileUrl;

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

        /** Name plus extension */
        this.namePlusExtension = ko.computed({
            read: function () {
                return ko.unwrap(ths.name) + ko.unwrap(ths.extension);
            },
            deferEvaluation: true
        });

        /**
        * Whether file is selected (in file manager)
        * @type {boolean}
        */
        this.isSelected = ko.observable();

        /** Download file */
        this.download = function () {
            appHelper.downloadURL(ths.fileUrl);
        };
    };

    return exports;
});