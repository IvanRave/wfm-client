/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /**
    * Sketch of well
    * @constructor
    * @param {object} data - Sketch data
    */
    var exports = function (data) {
        data = data || {};

        /**
        * Id of well
        * @type {number}
        */
        this.idOfWell = data.IdOfWell;

        /**
        * Id of file (guid): can be changed if select new file
        * @type {string}
        */
        this.idOfFileSpec = ko.observable(data.IdOfFileSpec);

        /**
        * Name of sketch
        * @type {string}
        */
        this.name = ko.observable(data.Name);

        /**
        * Description of sketch (html code)
        * @type {string}
        */
        this.description = ko.observable(data.Description);
    };

    return exports;
});