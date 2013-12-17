﻿/** @module */
define(['knockout', 'models/sections/section-base'], function (ko, SectionBase) {
    'use strict';

    /**
    * Section of well group
    * @param {object} data - section data
    * @param {module:models/wroup} wroup - well group (parent)
    * @constructor
    */
    var exports = function (data, wroup) {
        data = data || {};

        /** Get parent */
        this.getParent = function () {
            return wroup;
        };

        /**
        * Id of parent
        * @type {number}
        */
        this.wroupId = data.WroupId;

        /** Get list of section patterns from root */
        this.getListOfSectionPattern = function () {
            return ko.unwrap(this.getParent().getWellField().getWellRegion().getCompany().getRootViewModel().ListOfSectionPatternDto);
        };

        /** Add shared props to the section */
        SectionBase.call(this, data, 'wroup');
    };

    return exports;
});