/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /**
    * Volume of well
    * @constructor
    * @param {object} data - Volume data
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
        * Name
        * @type {string}
        */
        this.name = ko.observable(data.Name);

        /**
        * Description (html code)
        * @type {string}
        */
        this.description = ko.observable(data.Description);
    };

    return exports;
});