﻿/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /**
    * Section of well field
    * @param {object} data - section data
    * @param {module:models/well-field} wield - well field (parent)
    * @constructor
    */
    var exports = function (data, wield) {
        data = data || {};

        /** Get parent (well field) */
        this.getWield = function () {
            return wield;
        };

        /**
        * Section guid
        * @type {string}
        */
        this.Id = data.Id;

        /**
        * Whether the section is visible
        * @type {boolean}
        */
        this.IsVisible = ko.observable(data.IsVisible);

        /**
        * Id of section pattern: contains info like section Name and other
        * @type {string}
        */
        this.SectionPatternId = data.SectionPatternId;

        /**
        * Id of well field
        * @type {number}
        */
        this.WieldId = data.WieldId;
    };

    return exports;
});