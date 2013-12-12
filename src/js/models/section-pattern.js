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

        this.id = data.Id;

        this.name = data.Name;

        this.fileTypeRegExp = data.FileFormatRegExp;
    };

    return exports;
});