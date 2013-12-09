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

        var me = this;

        /**
        * Whether edit mode is turn on
        * @type {boolean}
        */
        me.isEditMode = ko.observable(false);

        /** Toggle edit mode: only if user can edit all */
        me.toggleEditMode = function () {
            if (me.canEditAll) {
                me.isEditMode(!ko.unwrap(me.isEditMode));
            }
        };
    };

    return exports;
});