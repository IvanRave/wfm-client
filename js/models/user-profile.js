/** @module */
define(['jquery', 'knockout', 'models/employee', 'services/datacontext', 'helpers/history-helper', 'services/auth'], function ($, ko, Employee, appDatacontext, historyHelper) {
    'use strict';

    /** Import employees for this user */
    function importEmployees(data, vm) {
        return $.map(data, function (item) {
            return new Employee(item, vm);
        });
    }

    /**
    * User profile (can be as a guest - without logon)
    * @constructor
    */
    var exports = function (vm) {
        /** Alternative for this */
        var ths = this;

        /**
        * User email (name)
        * @type {string}
        */
        this.email = ko.observable();

        /**
        * User pwd: need for logon or register or change password features
        * @type {string}
        */
        this.pwd = ko.observable();

        /**
        * Whether browser is remember this user
        * @type {boolean}
        */
        this.rememberMe = ko.observable(false);

        /**
        * Whether user is logged. If not - guest.
        * @type {boolean}
        */
        this.isLogged = ko.observable(false);

        /**
        * Whether user is registered: define page: logon or register
        * @type {boolean}
        */
        this.isRegistered = ko.observable(true);

        /** Toggle registered state: login or registered page */
        this.toggleIsRegistered = function () {
            ths.isRegistered(!ko.unwrap(ths.isRegistered));
        };

        /** Demo logon */
        this.demoLogon = function () {
            var demoEmail = 'wfm@example.com',
                demoPwd = '123321';

            appDatacontext.accountLogon({}, {
                'email': demoEmail,
                'password': demoPwd
            }).done(function () {
                ths.email(demoEmail);
                ths.isLogged(true);
                ths.loadEmployees();
            });
        };

        this.realLogOnError = ko.observable();

        /** Logon with user data */
        this.realLogOn = function () {
            ths.realLogOnError('');
            var tmpEmail = ko.unwrap(ths.email),
                tmpPwd = ko.unwrap(ths.pwd),
                tmpRememberMe = ko.unwrap(ths.rememberMe);

            appDatacontext.accountLogon({}, {
                'email': tmpEmail,
                'password': tmpPwd,
                'rememberMe': tmpRememberMe
            }).done(function () {
                ths.isLogged(true);
                ths.loadEmployees();
            }).fail(function (jqXHR) {
                if (jqXHR.status === 422) {
                    var resJson = jqXHR.responseJSON;
                    var tmpProcessError = '*';
                    require(['helpers/lang-helper'], function (langHelper) {
                        tmpProcessError += (langHelper.translate(resJson.errId) || 'unknown error');
                        ths.realLogOnError(tmpProcessError);
                    });
                }
            });
        };

        /** Log out from app: clean objects, set isLogged to false */
        this.logOff = function () {
            appDatacontext.accountLogoff().done(function () {
                ths.isLogged(false);
            });
        };

        /**
        * Whether info for user profile is loaded
        * @type {boolean}
        */
        this.isLoadedAccountInfo = ko.observable(false);

        /**
        * Get account info: Email, Roles, IsLogged
        * @param {object} [initialData] - WFM default values from url, like companyId, wellId etc.
        */
        this.loadAccountInfo = function (initialData) {
            initialData = initialData || {};

            ths.isLoadedAccountInfo(false);
            ths.isLogged(false);
            appDatacontext.getAccountInfo().done(function (r) {
                ths.email(r.Email);
                ths.isLogged(true);
                ths.loadEmployees(initialData);
            }).always(function () {
                ths.isLoadedAccountInfo(true);
            });
        };

        /**
        * User can be in many companies with access level for each company
        * @type {Array.<module:models/employee>}
        */
        this.employees = ko.observableArray();

        /**
        * Current selected employee
        * @type {module:models/employee}
        */
        this.selectedEmployee = ko.observable();

        /**
        * Select employee
        * @param {module:models/employee} employeeToSelect - Employee to select
        * @param {object} [initialData] - Initial data
        */
        this.selectEmployee = function (employeeToSelect, initialData) {
            initialData = initialData || {};

            // Unselect child
            employeeToSelect.company.selectedWegion(null);

            // Select self
            ths.selectedEmployee(employeeToSelect);

            // Select parents (no need)

            // Load all regions for company of selected employee
            ko.unwrap(ths.selectedEmployee).company.loadWegions(initialData);

            if (!initialData.isHistory) {
                historyHelper.pushState('/companies/' + employeeToSelect.companyId);
            }
        };

        /**
        * Whether employees are loaded 
        * @type {boolean}
        */
        this.isLoadedEmployees = ko.observable(false);

        /**
        * Load employee list for this user
        * @param {string} [initialData] - Default values to select, like company id, well id etc.
        */
        this.loadEmployees = function (initialData) {
            initialData = initialData || {};

            ths.isLoadedEmployees(false);
            ths.selectedEmployee(null);
            appDatacontext.getCompanyUserList().done(function (response) {
                if (!initialData.isHistory) {
                    historyHelper.pushState('/companies');
                }
                var emplArray = importEmployees(response, vm);
                ths.employees(emplArray);
                ths.isLoadedEmployees(true);

                if (initialData.companyId) {
                    emplArray.forEach(function (arrElem) {
                        if (arrElem.companyId === initialData.companyId) {
                            ths.selectEmployee(arrElem, initialData);
                        }
                    });
                }
            });
        };

        /**
        * Whether user is owner already: block link "register company"
        * @type {boolean}
        */
        ths.isOwnerAlready = ko.computed({
            read: function () {
                var result = false;

                var tmpEmployees = ko.unwrap(ths.employees);

                tmpEmployees.forEach(function (arrElem) {
                    if (ko.unwrap(arrElem.canManageAll)) {
                        result = true;
                    }
                });

                return result;
            },
            deferEvaluation: true
        });
    };

    return exports;
});