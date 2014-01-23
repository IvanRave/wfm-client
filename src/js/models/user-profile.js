/** @module */
define(['knockout', 'models/employee', 'services/register', 'helpers/lang-helper',
    'services/company-user', 'services/company',
    'helpers/history-helper', 'services/auth'], function (ko, Employee, registerService, langHelper,
        companyUserService, companyService, historyHelper, authService) {
        'use strict';

        /** Import employees for this user */
        function importEmployees(data, vm) {
            return data.map(function (item) { return new Employee(item, vm); });
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
            * User pwd confirmation: need for register purpose
            * @type {string}
            */
            this.pwdConfirmation = ko.observable();

            /**
            * Whether browser is remember this user
            * @type {boolean}
            */
            this.rememberMe = ko.observable(false);

            /**
            * Random token to confirm registration: sended to registered user through email
            * @type {string}
            */
            this.confirmationToken = ko.observable();

            /**
    * Whether user is logged. If not - guest.
    * @type {boolean}
    */
            this.isLogged = ko.observable(false);

            /**
            * Whether info for user profile is loaded
            * @type {boolean}
            */
            this.isLoadedAccountInfo = ko.observable(false);

            /**
            * Get account info: Email, Roles, IsLogged
            */
            this.loadAccountInfo = function () {
                ths.isLoadedAccountInfo(false);
                ths.isLogged(false);
                authService.getAccountInfo().done(function (r) {
                    ths.email(r.Email);
                    ths.isLogged(true);
                    ths.loadEmployees();
                }).always(function () {
                    ths.isLoadedAccountInfo(true);
                });
            };

            /** Demo logon */
            this.demoLogon = function () {
                var demoEmail = 'wfm@example.com',
                    demoPwd = '123321';

                authService.accountLogon({}, {
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

                authService.accountLogon({}, {
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
                            tmpProcessError += (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
                            ths.realLogOnError(tmpProcessError);
                        });
                    }
                });
            };

            /** Log out from app: clean objects, set isLogged to false */
            this.logOff = function () {
                authService.accountLogoff().done(function () {
                    ths.isLogged(false);
                });
            };

            /** Error message for unsuccessful registration */
            this.registerError = ko.observable('');
            /** Success message for successful registration */
            this.registerSuccess = ko.observable('');

            /** User registration */
            this.register = function () {
                // Clean error before new request
                ths.registerError('');
                ths.registerSuccess('');

                registerService.accountRegister({
                    'Email': ko.unwrap(ths.email),
                    'Password': ko.unwrap(ths.pwd),
                    'PasswordConfirmation': ko.unwrap(ths.pwdConfirmation)
                }).done(function () {
                    ths.registerSuccess('{{capitalizeFirst lang.checkToConfirmationToken}}');
                }).fail(function (jqXHR) {
                    if (jqXHR.status === 422) {
                        var resJson = jqXHR.responseJSON;
                        var tmpProcessError = '*';
                        tmpProcessError += (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
                        ths.registerError(tmpProcessError);
                    }
                });
            };

            this.confirmRegistrationError = ko.observable('');
            this.confirmRegistrationSuccess = ko.observable('');

            this.confirmRegistration = function () {
                ths.confirmRegistrationError('');
                ths.confirmRegistrationSuccess('');

                registerService.accountRegisterConfirmation({
                    'Email': ko.unwrap(ths.email),
                    'Token': ko.unwrap(ths.confirmationToken)
                }).done(function () {
                    ths.confirmRegistrationSuccess('{{capitalizeFirst lang.confirmRegistrationSuccessful}}');
                }).fail(function (jqXHR) {
                    if (jqXHR.status === 422) {
                        var resJson = jqXHR.responseJSON;
                        var tmpProcessError = '*';
                        tmpProcessError += (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
                        ths.confirmRegistrationError(tmpProcessError);
                    }
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
            */
            this.selectEmployee = function (employeeToSelect) {
                var tmpInitialUrlData = ko.unwrap(vm.initialUrlData);

                var tmpCompany = employeeToSelect.company;

                // Load all regions for company of selected employee
                tmpCompany.loadWegions();

                // If not selected children, then select first section
                if (tmpInitialUrlData.wegionId) {
                    // Select child after loading well regions
                    // If no well-regions then redirect to the main page
                }
                else if (tmpInitialUrlData.companySectionId) {
                    // Select section

                    var tmpSection = tmpCompany.getSectionByPatternId('company-' + tmpInitialUrlData.companySectionId);
                    tmpCompany.selectSection(tmpSection);

                    // Remove section id from
                    delete tmpInitialUrlData.companySectionId;
                    vm.initialUrlData(tmpInitialUrlData);
                }
                else {
                    // Unselect child
                    employeeToSelect.company.selectedWegion(null);
                    // Show dashboard
                    tmpCompany.unselectSection();

                }

                // Select ths
                ths.selectedEmployee(employeeToSelect);

                // Select parents (no need)
            };

            /**
            * Whether employees are loaded 
            * @type {boolean}
            */
            this.isLoadedEmployees = ko.observable(false);

            /**
            * Load employee list for this user
            */
            this.loadEmployees = function () {
                var tmpInitialUrlData = ko.unwrap(vm.initialUrlData);

                ths.isLoadedEmployees(false);
                ths.selectedEmployee(null);
                companyUserService.getCompanyUserList().done(function (response) {

                    // Set hash, add to history
                    historyHelper.pushState('/companies');

                    var emplArray = importEmployees(response, vm);
                    ths.employees(emplArray);
                    ths.isLoadedEmployees(true);

                    if (tmpInitialUrlData.companyId) {
                        emplArray.forEach(function (arrElem) {
                            if (arrElem.companyId === tmpInitialUrlData.companyId) {
                                // Select employee = select company
                                ths.selectEmployee(arrElem);
                                // Clean from initial url data to don't select again
                                delete tmpInitialUrlData.companyId;
                                vm.initialUrlData(tmpInitialUrlData);
                            }
                        });
                    }
                });
            };

            /**
            * Name of a new company: user can create only one company with manager access level
            * @type {string}
            */
            this.nameOfCreatedCompany = ko.observable('');

            /** Add new employee with company */
            this.postEmployee = function () {
                // Post employee company
                var tmpNameOfCreatedCompany = ko.unwrap(ths.nameOfCreatedCompany);
                if (tmpNameOfCreatedCompany) {
                    companyService.post({
                        'Name': tmpNameOfCreatedCompany,
                        'Description': ''
                    }).done(function () {
                        // Reload all companies: 
                        // by default - only one company (created company) for manage
                        // and other - for view and/or edit
                        ths.isLoadedEmployees(false);
                        ths.loadEmployees();
                    });
                }
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

            /**
            * Current selected employee
            * @type {module:models/employee}
            */
            this.selectedEmployee = ko.observable();

            /**
            * Select employee
            * @param {module:models/employee} employeeToSelect - Employee to select
            */
            this.selectEmployee = function (employeeToSelect) {
                var tmpInitialUrlData = ko.unwrap(vm.initialUrlData);

                var tmpCompany = employeeToSelect.company;

                // Load all regions for company of selected employee
                tmpCompany.loadWegions();

                // If not selected children, then select first section
                if (tmpInitialUrlData.wegionId) {
                    // Select child after loading well regions
                    // If no well-regions then redirect to the main page
                }
                else if (tmpInitialUrlData.companySectionId) {
                    // Select section

                    var tmpSection = tmpCompany.getSectionByPatternId('company-' + tmpInitialUrlData.companySectionId);
                    tmpCompany.selectSection(tmpSection);

                    // Remove section id from
                    delete tmpInitialUrlData.companySectionId;
                    vm.initialUrlData(tmpInitialUrlData);
                }
                else {
                    // Unselect child
                    employeeToSelect.company.selectedWegion(null);
                    // Show dashboard
                    tmpCompany.unselectSection();

                }

                // Select ths
                ths.selectedEmployee(employeeToSelect);

                // Select parents (no need)
            };
        };

        return exports;
    });