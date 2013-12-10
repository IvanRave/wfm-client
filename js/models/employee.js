/** @module */
define(['knockout','models/company'], function (ko, Company) {
    'use strict';

    /**
    * Employee (user in company)
    * @constructor
    * @param {object} data - Employee data
    */
    var exports = function (data, vm) {
        data = data || {};

        /** Alternative of this */
        var ths = this;

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

        /**
        * Can this user view all
        * @type {boolean}
        */
        this.canViewAll = (this.accessLevel & 4) === 4;

        /**
        * Can this user edit all: workspace, etc.
        * @type {boolean}
        */
        this.canEditAll = (this.accessLevel & 2) === 2;

        /**
        * Can this user manage all: users, system settings for company, etc.
        * @type {boolean}
        */
        this.canManageAll = (this.accessLevel & 1) === 1;

        /**
        * Whether edit mode is turn on
        * @type {boolean}
        */
        this.isEditMode = ko.observable(false);

        /** Toggle edit mode: only if user can edit all */
        this.toggleEditMode = function () {
            if (ths.canEditAll) {
                ths.isEditMode(!ko.unwrap(ths.isEditMode));
            }
        };
    };

    return exports;
});