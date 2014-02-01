/** @module */
define(['knockout',
    'viewmodels/company'],
    function (ko,
        VwmCompany) {
        'use strict';

        /**
        * Employee view model (user in company)
        * @constructor
        * @param {string} koUnqOfSlcVwmStage - Id of Selected view of employee in user-profile
        */
        var exports = function (mdlEmployee, koUnqOfSlcVwmStage, defaultSlcData) {
            var ths = this;

            /**
            * Data model for employee
            * @type {module:models/employee}
            */
            this.mdlEmployee = mdlEmployee;

            /**
            * Main view model for company
            * @type {module:viewmodels/company}
            */
            this.vwmCompany = new VwmCompany(ths.mdlEmployee.company, koUnqOfSlcVwmStage, defaultSlcData);

            /** Unique id of view: id of employee = id of company */
            this.unq = ths.vwmCompany.unq;

            /**
            * Whether edit mode is turn on
            * @type {boolean}
            */
            this.isEditMode = ko.observable(false);

            /** Toggle edit mode: only if user can edit all */
            this.toggleEditMode = function () {
                if (ths.mdlEmployee.canEditAll) {
                    ths.isEditMode(!ko.unwrap(ths.isEditMode));
                }
            };
        };

        return exports;
    });