/** @module */
define(['knockout'], function (ko) {
    'use strict';
    
    /**
    * Viewmodel: volume of well
    * @constructor
    */
    var exports = function (mdlVolumeOfWell, koSlcVwmOfVolumeOfWell) {

        var ths = this;

        /**
        * Model: volume
        * @type {<models/volume-of-well>}
        */
        this.mdlVolumeOfWell = mdlVolumeOfWell;

        /**
        * View id = id of file spec (unique in every well) (guid)
        * @type {string}
        */
        this.vid = mdlVolumeOfWell.idOfFileSpec;

        this.isSlcVwmVolumeOfWell = ko.computed({
            read: function () {
                return ko.unwrap(koSlcVwmOfVolumeOfWell).vid === ths.vid;
            },
            deferEvaluation: true
        });
    };

    return exports;
});