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

        this.fileFormatRegExp = data.FileFormatRegExp;
    };

    return exports;
});