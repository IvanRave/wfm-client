/** @module */
define([
    'jquery',
    'knockout',
    'helpers/history-helper',
    'helpers/lang-helper',
    'viewmodels/user-profile'], function ($, ko, historyHelper, langHelper, VwmUserProfile) {
        'use strict';

        /**
        * Workspace view model: root for knockout
        * @constructor
        */
        var exports = function (mdlWorkspace) {
            /** Alternative for this */
            var ths = this;

            /** Data model for this view */
            this.mdlWorkspace = mdlWorkspace;

            /** 
            * Whether left tree menu with well regions, groups, fields, wells is visible
            * @type {boolean}
            */
            this.isVisibleMenu = ko.observable(true);

            // Left tree menu with well regions, groups, fields, wells
            this.toggleIsVisibleMenu = function () {
                ths.isVisibleMenu(!ko.unwrap(ths.isVisibleMenu));
            };

            this.sidebarWrapCss = ko.computed({
                read: function () {
                    return ko.unwrap(ths.isVisibleMenu) ? 'sidebar-wrap-visible' : 'hidden';
                },
                deferEvaluation: true
            });

            this.workAreaCss = ko.computed({
                read: function () {
                    return ko.unwrap(ths.isVisibleMenu) ? 'work-area' : '';
                },
                deferEvaluation: true
            });

            this.sidebarToggleCss = ko.computed({
                read: function () {
                    return ko.unwrap(ths.isVisibleMenu) ? 'sidebar-toggle-visible' : 'sidebar-toggle-hidden';
                },
                deferEvaluation: true
            });

            /**
            * Whether current employee in edit mode: fast access for view
            * @type {boolean}
            */
            this.isEmployeeInEditMode = ko.computed({
                // TODO: change to isVwmEmployeeInEdit mode
                read: function () {
                    var tmpVwmUserProfile = ko.unwrap(ths.vwmUserProfile);
                    if (tmpVwmUserProfile) {
                        var tmpEmployee = ko.unwrap(tmpVwmUserProfile.slcVwmChild);
                        if (tmpEmployee) {
                            return ko.unwrap(tmpEmployee.isEditMode);
                        }
                    }
                },
                deferEvaluation: true
            });

            /** Data from url to select need stages and sections: initialUrlData */
            var defaultSlcData = historyHelper.getInitialData(document.location.hash.substring(1));

            /**
            * User profile view model
            * @type {<module:viewmodels/user-profile>}
            */
            this.vwmUserProfile = ko.computed({
                read: function () {
                    var tmpMdlUserProfile = ko.unwrap(ths.mdlWorkspace.userProfile);
                    if (tmpMdlUserProfile) {
                        return new VwmUserProfile(tmpMdlUserProfile, defaultSlcData);
                    }
                },
                deferEvaluation: true
            });

            /**
            * Whether user is registered: define page: logon or register
            * @type {boolean}
            */
            this.isRegisteredPage = ko.observable(true);

            /** Toggle registered state: login or register page */
            this.toggleIsRegisteredPage = function () {
                ths.isRegisteredPage(!ko.unwrap(ths.isRegisteredPage));
            };

            /** Demo logon */
            this.demoLogOn = function () {
                mdlWorkspace.sendLogOn({
                    'email': 'wfm@example.com',
                    'password': '123321'
                });
            };

            this.objToRealLogOn = {
                email: ko.observable(''),
                /**
                * User pwd: need for logon or register or change password features
                * @type {string}
                */
                password: ko.observable(''),
                /**
                * Whether browser is remember this user
                * @type {boolean}
                */
                rememberMe: ko.observable(false)
            };

            this.errToRealLogOn = ko.observable('');

            this.realLogOn = function () {
                ths.errToRealLogOn('');
                // get obj from fields check obj
                // Convert to object without observables
                var tmpObj = ko.toJS(ths.objToRealLogOn);
                mdlWorkspace.sendLogOn(tmpObj, function () {
                    // Clear added object: if user logoff then need empty fields to logon again (for different user)
                    ths.objToRealLogOn.email('');
                    ths.objToRealLogOn.password('');
                    ths.objToRealLogOn.rememberMe(false);
                    ths.errToRealLogOn('');
                }, function (jqXhr) {
                    if (jqXhr.status === 422) {
                        var resJson = jqXhr.responseJSON;
                        ths.errToRealLogOn(langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
                    }
                });
            };

            this.objToRegister = {
                email: ko.observable(''),
                /**
                * User password: need for logon or register or change password features
                * @type {string}
                */
                password: ko.observable(''),
                /**
                * User password confirmation: need for register purpose
                * @type {string}
                */
                passwordConfirmation: ko.observable('')
            };

            /** Messages for registration: error and success */
            this.msgToRegister = {
                err: ko.observable(''),
                scs: ko.observable('')
            };

            this.register = function () {
                // Clean msges
                ths.msgToRegister.err('');
                ths.msgToRegister.scs('');

                var tmpObjToRegister = ko.toJS(ths.objToRegister);
                mdlWorkspace.sendRegister(tmpObjToRegister, function () {
                    ths.msgToRegister.scs('{{capitalizeFirst lang.checkToConfirmationToken}}');
                }, function (jqXHR) {
                    if (jqXHR.status === 422) {
                        var resJson = jqXHR.responseJSON;
                        var tmpProcessError = (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
                        ths.msgToRegister.err(tmpProcessError);
                    }
                });
            };

            this.msgToConfirmRegistration = {
                err: ko.observable(''),
                scs: ko.observable('')
            };

            this.objToConfirmRegistration = {
                email: ko.observable(''),
                /**
                * Random token to confirm registration: sended to registered user through email
                * @type {string}
                */
                token: ko.observable('')
            };

            /** Confirm registration */
            this.confirmRegistration = function () {
                ths.msgToConfirmRegistration.err('');
                ths.msgToConfirmRegistration.scs('');

                var tmpObjToConfirmRegistration = ko.toJS(ths.objToConfirmRegistration);

                // TODO: check obj, using format

                mdlWorkspace.sendConfirmRegistration(tmpObjToConfirmRegistration, function () {
                    ths.msgToConfirmRegistration.scs('{{capitalizeFirst lang.confirmRegistrationSuccessful}}');
                }, function (jqXhr) {
                    if (jqXhr.status === 422) {
                        var resJson = jqXhr.responseJSON;
                        var tmpProcessError = (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
                        ths.msgToConfirmRegistration.err(tmpProcessError);
                    }
                });
            };

            /** Back, forward, re   fresh browser navigation */
            // TODO: back
            ////window.onpopstate = function () {
            ////    var stateData = historyHelper.getInitialData(document.location.hash.substring(1));
            ////    // When load any info - do not push info to history again
            ////    stateData.isHistory = true;
            ////    // Reload all data
            ////    ths.initialUrlData(stateData);

            ////    console.log('location: ' + document.location.hash + ', state: ' + JSON.stringify(stateData));

            ////    ths.userProfile.loadUserProfile();
            ////};
        };

        return exports;
    });