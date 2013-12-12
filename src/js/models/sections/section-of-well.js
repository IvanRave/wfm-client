/** @module */
define(['jquery', 'knockout', 'models/sections/section-base'], function ($, ko, SectionBase) {
    'use strict';

    /**
    * Section of well
    * @param {object} data - section data
    * @param {module:models/well} well - well (parent)
    * @constructor
    */
    var exports = function (data, well) {
        data = data || {};

        /** Get parent (well) */
        this.getParent = function () {
            return well;
        };

        /**
        * Id of well
        * @type {number}
        */
        this.wellId = data.WellId;

        /** Get list of section patterns from root */
        this.getListOfSectionPattern = function () {
            return ko.unwrap(this.getParent().getWellGroup().getWellField().getWellRegion().getParentViewModel().ListOfSectionPatternDto);
        };

        /** Add shared props to the section */
        SectionBase.call(this, data, 'well');
    };

    return exports;
});