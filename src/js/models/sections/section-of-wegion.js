/** @module */
define(['knockout', 'models/sections/section-base'], function (ko, SectionBase) {
    'use strict';

    /**
    * Section of well region
    * @param {object} data - section data
    * @param {module:models/wegion} wegion - well region (parent)
    * @constructor
    */
    var exports = function (data, wegion) {
        data = data || {};

        /** Get parent */
        this.getParent = function () {
            return wegion;
        };

        /**
        * Id of well
        * @type {number}
        */
        this.wegionId = data.WegionId;

        /** Add shared props to the section */
        SectionBase.call(this, data);
    };

    return exports;
});