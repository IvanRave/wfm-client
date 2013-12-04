/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /**
    * Company file model
    * @param {object} data - File data
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
        * Company guid
        * @type {string}
        */
        this.CompanyId = data.CompanyId;

        /**
        * Is active or not (in Recycle Bin)
        * @type {boolean}
        */
        this.IsActive = ko.observable(data.IsActive);
    };

    return exports;
});