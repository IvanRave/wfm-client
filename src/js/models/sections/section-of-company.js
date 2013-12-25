/** @module */
define(['knockout', 'models/sections/section-base'], function (ko, SectionBase) {
    'use strict';

    /**
    * Section of company
    * @param {object} data - section data
    * @param {module:models/company} company - company (parent)
    * @constructor
    */
    var exports = function (data, company) {
        data = data || {};

        /** Get parent (well) */
        this.getParent = function () {
            return company;
        };

        /**
        * Id of well
        * @type {number}
        */
        this.companyId = data.CompanyId;

        /** Add shared props to the section */
        SectionBase.call(this, data);
    };

    return exports;
});