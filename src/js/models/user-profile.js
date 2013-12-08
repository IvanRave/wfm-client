/** @module */
define(['jquery', 'knockout', 'models/employee', 'services/datacontext'], function ($, ko, Employee, appDatacontext) {
    'use strict';

    /** Import employees for this user */
    function importEmployees(data, vm) {
        return $.map(data, function (item) {
            return new Employee(item, vm);
        });
    }

    /**
    * User profile
    * @constructor
    */
    var exports = function (vm) {
        /**
        * User can be in many companies with access level for each company
        * @type {Array.<module:models/employee}
        */
        this.employees = ko.observableArray();

        /**
        * Current selected employee
        * @type {module:models/employee}
        */
        this.selectedEmployee = ko.observable();

        var me = this;

        /** Load employee list for this user */
        me.loadEmployees = function (companyIdForSelect) {
            appDatacontext.getCompanyUserList().done(function (response) {
                var emplArray = importEmployees(response, vm);
                me.employees(emplArray);

                emplArray.forEach(function (arrElem) {
                    if (arrElem.companyId === companyIdForSelect) {
                        me.selectedEmployee(arrElem);
                    }
                });
            });
        };
    };

    return exports;
});