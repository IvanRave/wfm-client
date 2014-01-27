/** @module */
define([], function () {
    'use strict';

    /**
    * Well group view model
    * @constructor
    */
    var exports = function (mdlWroup) {
        //var ths = this;

        this.mdlStage = mdlWroup;

        this.unq = mdlWroup.id;
        
        // TODO: add other fields
    };

    return exports;
});