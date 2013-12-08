/** @module */
define(['models/company'], function (Company) {
    'use strict';

    /**
    * Employee (user in company)
    * @constructor
    * @param {object} data - Employee data
    */
    var exports = function (data, vm) {
        data = data || {};

        /**
        * Company guid
        * @type {string}
        */
        this.companyId = data.CompanyId;

        /**
        * Company
        * @type {module:models/company}
        */
        this.company = new Company(data.CompanyDto, vm);

        /**
        * User guid
        * @type {string}
        */
        this.userProfileId = data.UserProfileId;

        /**
        * Access level for user in this company
        * @type {number}
        */
        this.accessLevel = data.AccessLevel;
    };

    return exports;
});