/** @module */
define(['knockout', 'viewmodels/wegion'], function (ko, VwmWegion) {
    'use strict';

    /**
    * Company view model
    * @constructor
    */
    var exports = function (mdlCompany) {

        var ths = this;

        /**
        * Company data model
        * @type {<module:models/company>}
        */
        this.mdlCompany = mdlCompany;

        /**
        * Well region view model (selected well region)
        * @type {<module:viewmodels/wegion>}
        */
        this.vwmWegion = ko.computed({
            read: function () {
                var tmpWegion = ko.unwrap(ths.mdlCompany.selectedWegion);
                if (tmpWegion) {
                    return new VwmWegion(tmpWegion);
                }
            },
            deferEvaluation: true
        });
    };

    return exports;
});