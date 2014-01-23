/** @module */
define(['knockout', 'viewmodels/company'], function (ko, VwmCompany) {
    'use strict';

    /**
    * Employee view model (user in company)
    * @constructor
    */
    var exports = function (mdlEmployee) {
        var ths = this;

        /**
        * Data model for employee
        * @type {<module:models/employee>}
        */
        this.mdlEmployee = mdlEmployee;

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

        /**
        * Main view model for company
        * @type {<module:viewmodels/company>}
        */
        ths.vwmCompany = new VwmCompany(ths.mdlEmployee.company);
    };

    return exports;
});