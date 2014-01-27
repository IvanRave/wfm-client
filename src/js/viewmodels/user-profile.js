/** @module */
define(['knockout', 'viewmodels/employee', 'viewmodels/bases/stage-child-base'], function (ko, VwmEmployee, VwmStageChildBase) {
    'use strict';

    /**
    * User profile (can be as a guest - without logon)
    * @constructor
    * @param {object} defaultSlcData - Ids of models, which need to select automatically
    */
    var exports = function (mdlUserProfile, defaultSlcData) {
        /** Alternative for this */
        var ths = this;

        // 1. Create model
        // 2.1 Create viewmodel, using model
        // 2.2 Start to load data to model (all employees)

        /**
        * Link to user profile data model
        * @type {<module:models/user-profile>}
        */
        this.mdlStage = mdlUserProfile;

        /**
        * User profile may contain few employee (with companies)
        * @type {Array.<module:viewmodels/employee>}
        */
        this.listOfVwmChild = ko.computed({
            read: function () {
                var listOfMdlEmployee = ko.unwrap(ths.mdlStage.employees);
                return listOfMdlEmployee.map(function (elem) {
                    return new VwmEmployee(elem, ths.slcVwmChild, defaultSlcData);
                });
            },
            deferEvaluation: true
        });

        /** Has few children to select */
        VwmStageChildBase.call(this, defaultSlcData.companyId);

        // Other stagebase view
        // Has no sections and widgets - StageChildBase
        // Has no parent with few user profiles - StageParentBase
    };

    return exports;
});