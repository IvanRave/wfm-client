/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /**
    * Viewmodel: log of well
    * @constructor
    */
    var exports = function (mdlLogOfWell, koSlcVid) {

        var ths = this;

        /**
        * Module: log of well
        * @type {module:models/log-of-well}
        */
        this.mdlLogOfWell = mdlLogOfWell;

        /**
        * View guid
        * @type {string}
        */
        this.vid = mdlLogOfWell.id;

        /**
        * Whether view is selected
        * @type {boolean}
        */
        this.isSlc = ko.computed({
            read: function () {
                return ths.vid === ko.unwrap(koSlcVid);
            },
            deferEvaluation: true
        });
    };

    return exports;
});