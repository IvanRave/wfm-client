/** @module */
define(['knockout', 'viewmodels/employee'], function (ko, VwmEmployee) {
        'use strict';

        /**
        * User profile (can be as a guest - without logon)
        * @constructor
        */
        var exports = function (mdlUserProfile) {
            /** Alternative for this */
            var ths = this;

            /**
            * Link to user profile data model
            * @type {<module:models/user-profile>}
            */
            this.mdlUserProfile = mdlUserProfile;

            /**
            * Whether user is registered: define page: logon or register
            * @type {boolean}
            */
            this.isRegistered = ko.observable(true);

            /** Toggle registered state: login or register page */
            this.toggleIsRegistered = function () {
                ths.isRegistered(!ko.unwrap(ths.isRegistered));
            };

            /**
            * Employee viewmodel - current selected employee
            * @type {<module:viewmodels/employee>}
            */
            this.vwmEmployee = ko.computed({
                read: function () {
                    var tmpEmployee = ko.unwrap(ths.mdlUserProfile.selectedEmployee);

                    if (tmpEmployee) {
                        console.log('Created new view with selected employee');
                        return new VwmEmployee(tmpEmployee);
                    }
                },
                deferEvaluation: true
            });
        };

        return exports;
    });