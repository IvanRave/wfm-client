/** @module */
define(['knockout','models/company', 'services/company'], function (ko, Company, companyService) {
    'use strict';

    /**
    * Employee (user in company)
    * @constructor
    * @param {object} data - Employee data
    */
    var exports = function (data, vm) {
        data = data || {};

        /** Alternative of this */
        ////var ths = this;

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

        /** Remove company with employee */
        this.removeChild = function (companyToRemove) {
            var tmpCompanyId = ko.unwrap(companyToRemove.id);
            if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(companyToRemove.name) + '"?')) {
                companyService.remove(tmpCompanyId).done(function () {
                    // Reload all employees
                    vm.userProfile.isLoadedEmployees(false);
                    vm.userProfile.loadEmployees();
                });
            }
        };
    };

    return exports;
});