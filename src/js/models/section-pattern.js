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

        this.Id = data.Id;

        this.Name = data.Name;

        this.FileFormatRegExp = data.FileFormatRegExp;
    };

    return exports;
});