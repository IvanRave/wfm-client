/** @module */
define(['jquery', 'knockout', 'models/sections/section-base'], function ($, ko, SectionBase) {
    'use strict';

    /**
    * Section of well field
    * @param {object} data - section data
    * @param {module:models/wield} wield - well field (parent)
    * @constructor
    */
    var exports = function (data, wield) {
        data = data || {};

        /** Get parent (well field) */
        this.getParent = function () {
            return wield;
        };

        /**
        * Id of well field
        * @type {number}
        */
        this.wieldId = data.WieldId;

        /** Get list from root */
        this.getListOfSectionPattern = function () {
            return ko.unwrap(this.getParent().getWellRegion().getParentViewModel().ListOfSectionPatternDto);
        };

        // Add shared props
        SectionBase.call(this, data, 'wield');
    };

    return exports;
});