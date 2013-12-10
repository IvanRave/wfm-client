/** @module */
define(['jquery', 'knockout', 'models/employee', 'services/datacontext', 'services/auth'], function ($, ko, Employee, appDatacontext) {
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

        var me = this;

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
            me.isRegistered(!ko.unwrap(me.isRegistered));
        };

        /** Demo logon */
        this.demoLogon = function () {
            var demoEmail = 'wfm@example.com',
                demoPwd = '123321';

            appDatacontext.accountLogon({}, {
                'email': demoEmail,
                'password': demoPwd
            }).done(function () {
                me.email(demoEmail);
                me.isLogged(true);
                me.loadEmployees();
            });
        };

        this.realLogOnError = ko.observable();

        /** Logon with user data */
        this.realLogOn = function () {
            me.realLogOnError('');
            var tmpEmail = ko.unwrap(me.email),
                tmpPwd = ko.unwrap(me.pwd),
                tmpRememberMe = ko.unwrap(me.rememberMe);

            appDatacontext.accountLogon({}, {
                'email': tmpEmail,
                'password': tmpPwd,
                'rememberMe': tmpRememberMe
            }).done(function () {
                me.isLogged(true);
                me.loadEmployees();
            }).fail(function (jqXHR) {
                if (jqXHR.status === 422) {
                    var resJson = jqXHR.responseJSON;
                    var tmpProcessError = '*';
                    require(['helpers/lang-helper'], function (langHelper) {
                        tmpProcessError += (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
                        me.realLogOnError(tmpProcessError);
                    });
                }
            });
        };

        /** Log out from app: clean objects, set isLogged to false */
        this.logOff = function () {
            appDatacontext.accountLogoff().done(function () {
                me.isLogged(false);
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

            me.isLoadedAccountInfo(false);
            me.isLogged(false);
            appDatacontext.getAccountInfo().done(function (r) {
                me.email(r.Email);
                me.isLogged(true);
                me.loadEmployees(initialData);
            }).always(function () {
                me.isLoadedAccountInfo(true);
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
        me.selectEmployee = function (employeeToSelect, initialData) {
            initialData = initialData || {};

            me.selectedEmployee(employeeToSelect);
            // Load all regions for company of selected employee
            ko.unwrap(me.selectedEmployee).company.loadWegions(initialData);

            if (!initialData.isHistory) {
                history.pushState({ companyId: employeeToSelect.companyId }, ko.unwrap(employeeToSelect.company.name), '#companies/' + employeeToSelect.companyId + '/well-regions');
            }
        };

        /**
        * Whether employees are loaded 
        * @type {boolean}
        */
        me.isLoadedEmployees = ko.observable(false);

        /**
        * Load employee list for this user
        * @param {string} [initialData] - Default values to select, like company id, well id etc.
        */
        me.loadEmployees = function (initialData) {
            initialData = initialData || {};

            me.isLoadedEmployees(false);
            me.selectedEmployee(null);
            appDatacontext.getCompanyUserList().done(function (response) {
                if (!initialData.isHistory) {
                    history.pushState({}, 'Companies', '#companies');
                }
                var emplArray = importEmployees(response, vm);
                me.employees(emplArray);
                me.isLoadedEmployees(true);

                if (initialData.companyId) {
                    emplArray.forEach(function (arrElem) {
                        if (arrElem.companyId === initialData.companyId) {
                            me.selectEmployee(arrElem, initialData);
                        }
                    });
                }
            });
        };

        /**
        * Whether user is owner already: block link "register company"
        * @type {boolean}
        */
        me.isOwnerAlready = ko.computed({
            read: function () {
                var result = false;

                var tmpEmployees = ko.unwrap(me.employees);

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