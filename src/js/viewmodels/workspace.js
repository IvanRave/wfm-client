/** @module */
define([
    'jquery',
    'knockout',
    'viewmodels/user-profile'], function ($, ko, VwmUserProfile) {
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
                read: function () {
                    var tmpEmployee = ko.unwrap(ths.vwmUserProfile.vwmEmployee);
                    if (tmpEmployee){
                        return ko.unwrap(tmpEmployee.isEditMode);
                    }
                },
                deferEvaluation: true
            });

            // Children views

            /**
            * User profile view model
            * @type {<module:viewmodels/user-profile>}
            */
            this.vwmUserProfile = new VwmUserProfile(ths.mdlWorkspace.userProfile);
        };

        return exports;
    });