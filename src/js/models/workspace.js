/** @module */
define([
    'knockout',
    'helpers/app-helper',
    'models/user-profile',
    'models/section-pattern',
    'services/section-pattern',
    'models/wfm-param-squad',
    'services/wfm-param-squad',
    'services/auth',
    'services/register',
    'helpers/knockout-lazy'],
    function (ko,
    appHelper,
    UserProfile,
    SectionPattern,
    sectionPatternService,
    WfmParamSquad,
    wfmParamSquadService,
    userProfileService,
    registerService) {
        'use strict';

        function importWfmParamSquadList(data) {
            return (data || []).map(function (item) { return new WfmParamSquad(item); });
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
                wfmParamSquadService.getInclusive().done(function (r) {
                    ths.wfmParamSquadList(importWfmParamSquadList(r));
                });
            }, this);

            /** Get list of section patterns: lazy loading by first request */
            this.ListOfSectionPatternDto = ko.lazyObservableArray(function () {
                sectionPatternService.get().done(function (r) {
                    ths.ListOfSectionPatternDto(importListOfSectionPattern(r));
                });
            }, this);

            /** Get all parameters from all groups as one dimensional array */
            this.wfmParameterList = ko.computed({
                read: function () {
                    var outArr = [];
                    var tmpSquadList = ko.unwrap(ths.wfmParamSquadList);
                    tmpSquadList.forEach(function (sqdElem) {
                        ko.unwrap(sqdElem.wfmParameterList).forEach(function (prmElem) {
                            outArr.push(prmElem);
                        });
                    });
                    return outArr;
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