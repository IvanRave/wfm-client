﻿/** @module */
define([
    'knockout',
    'services/datacontext',
    'helpers/modal-helper',
    'helpers/app-helper',
    'models/user-profile',
    'models/section-pattern',
    'services/auth',
    'services/register',
    'helpers/knockout-lazy',
    'models/wfm-param-squad'],
    function (ko, datacontext, bootstrapModal, appHelper, UserProfile, SectionPattern, userProfileService, registerService) {
        'use strict';

        // WfmParamSquadList (convert data objects into array)
        function importWfmParamSquadList(data) {
            return (data || []).map(function (item) { return datacontext.createWfmParamSquad(item); });
        }

        function importListOfSectionPattern(data) {
            return (data || []).map(function (item) { return new SectionPattern(item); });
        }

        /**
        * Root view model
        * @constructor
        */
        var exports = function () {
            /** Alternative for this */
            var ths = this;

            // =====================================Wfm parameters begin==========================================================
            this.wfmParamSquadList = ko.lazyObservableArray(function () {
                datacontext.getWfmParamSquadList({ is_inclusive: true }).done(function (r) {
                    ths.wfmParamSquadList(importWfmParamSquadList(r));
                });
            }, this);

            /** Get list of section patterns: lazy loading by first request */
            this.ListOfSectionPatternDto = ko.lazyObservableArray(function () {
                datacontext.getListOfSectionPattern().done(function (r) {
                    ths.ListOfSectionPatternDto(importListOfSectionPattern(r));
                });
            }, this);

            // Get all parameters from all groups as one dimensional array
            this.wfmParameterList = ko.computed({
                read: function () {
                    return ko.unwrap(ths.wfmParamSquadList).map(function (sqdElem) {
                        return ko.unwrap(sqdElem.wfmParameterList).map(function (prmElem) {
                            return prmElem;
                        });
                    });
                },
                deferEvaluation: true
            });

            /** 
            * User profile model
            * @type {module:models/user-profile}
            */
            this.userProfile = ko.observable();

            /**
            * Whether profile is loaded: profile can be loaded, but not exists (if user is not logged or registered)
            *    Existing of profile need to check, using ths.userProfile object
            * @type {boolean}
            */
            this.isTriedToLoadUserProfile = ko.observable(false);

            /**
            * Try to get user profile: Email, Roles, IsLogged
            */
            this.tryToLoadUserProfile = function () {
                console.log('tried to load user profile');
                // Send auth cookies to the server
                userProfileService.getUserProfile().done(function (r) {
                    ths.userProfile(new UserProfile(r, ths));
                }).always(function () {
                    ths.isTriedToLoadUserProfile(true);
                });
            };

            this.sendLogOn = function (logOnData, scsCallback, errCallback) {
                userProfileService.accountLogon(logOnData).done(function (r) {
                    ths.userProfile(new UserProfile(r, ths));
                    if (scsCallback) { scsCallback(); }
                }).fail(errCallback);
            };

            this.sendRegister = function (objToRegister, scsCallback, errCallback) {
                registerService.accountRegister(objToRegister).done(scsCallback).fail(errCallback);
            };

            this.sendConfirmRegistration = function (objToConfirmRegistration, scsCallback, errCallback) {
                registerService.accountRegisterConfirmation(objToConfirmRegistration).done(scsCallback).fail(errCallback);
            };

            /** Log out from app: clean objects, set isLogged to false */
            this.logOff = function () {
                userProfileService.accountLogoff().done(function () {
                    // clean user profile with cookies
                    ths.userProfile(null);
                    // automatically cleaned all child companies, wegions etc. 
                });
            };

            /** After initialization: try to load user */
            this.tryToLoadUserProfile();
        };

        return exports;
    });