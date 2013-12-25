/** @module */
define(['knockout', 'models/sections/section-base'], function (ko, SectionBase) {
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

        /** Add shared props to the section */
        SectionBase.call(this, data);
    };

    return exports;
});