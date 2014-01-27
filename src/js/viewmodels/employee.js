/** @module */
define(['knockout',
    'viewmodels/company',
    'viewmodels/bases/stage-parent-base'],
    function (ko,
        VwmCompany,
        VwmStageParentBase) {
        'use strict';

        /**
        * Employee view model (user in company)
        * @constructor
        * @param {Object} koSlcVwmStage - Selected view of employee in user-profile
        */
        var exports = function (mdlEmployee, koSlcVwmStage, defaultSlcData) {
            var ths = this;

            /**
            * Data model for employee
            * @type {<module:models/employee>}
            */
            this.mdlEmployee = mdlEmployee;

            /** Employee has a parent with few employees */
            VwmStageParentBase.call(ths, koSlcVwmStage);

            /**
            * Main view model for company
            * @type {<module:viewmodels/company>}
            */
            this.vwmCompany = new VwmCompany(ths.mdlEmployee.company, defaultSlcData);

            /** Unique id of view: id of employee = id of company */
            this.unq = this.vwmCompany.unq;

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