/** @module */
define([
    'jquery',
    'knockout',
    'services/datacontext',
    'helpers/modal-helper',
    'helpers/app-helper',
    'models/user-profile',
    'helpers/history-helper',
    'helpers/knockout-lazy',
    'models/wfm-param-squad'], function ($, ko, datacontext, bootstrapModal, appHelper, UserProfile, historyHelper) {
        'use strict';

        // WfmParamSquadList (convert data objects into array)
        function importWfmParamSquadList(data) {
            return (data || []).map(function (item) { return datacontext.createWfmParamSquad(item); });
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
                    require(['models/section-pattern'], function (SectionPattern) {

                        function importListOfSectionPattern(data) {
                            return $.map(data || [], function (item) { return new SectionPattern(item); });
                        }

                        ths.ListOfSectionPatternDto(importListOfSectionPattern(r));
                    });
                });
            }, this);

            // Get all parameters from all groups as one dimensional array
            this.wfmParameterList = ko.computed({
                read: function () {
                    return $.map(ko.unwrap(ths.wfmParamSquadList), function (sqdElem) {
                        return $.map(ko.unwrap(sqdElem.wfmParameterList), function (prmElem) {
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
            this.userProfile = new UserProfile(ths);

            this.initialUrlData = ko.observable(historyHelper.getInitialData(document.location.hash.substring(1)));

            // Data loading
            /** Auth user profile and load data if successful */
            this.userProfile.loadAccountInfo();

            /** Back, forward, refresh browser navigation */
            // TODO: back
            ////window.onpopstate = function () {
            ////    var stateData = historyHelper.getInitialData(document.location.hash.substring(1));
            ////    // When load any info - do not push info to history again
            ////    stateData.isHistory = true;
            ////    // Reload all data
            ////    ths.initialUrlData(stateData);

            ////    console.log('location: ' + document.location.hash + ', state: ' + JSON.stringify(stateData));

            ////    ths.userProfile.loadAccountInfo();
            ////};
        };

        return exports;
    });