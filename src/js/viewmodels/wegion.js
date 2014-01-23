/** @module */
define(['knockout', 'viewmodels/wield'], function (ko, VwmWield) {
    'use strict';

    /**
    * Well region view model
    * @constructor
    */
    var exports = function (mdlWegion) {

        var ths = this;

        /**
        * Model wegion
        * @type {<module:models/wegion>}
        */
        this.mdlWegion = mdlWegion;

        /**
        * Well region view model (selected well region)
        * @type {<module:viewmodels/wegion>}
        */
        this.vwmWield = ko.computed({
            read: function () {
                var tmpWield = ko.unwrap(ths.mdlWegion.selectedWield);
                if (tmpWield) {
                    return new VwmWield(tmpWield);
                }
            },
            deferEvaluation: true
        });
    };

    return exports;
});