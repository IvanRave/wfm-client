/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /**
    * Viewmodel: well marker (in map of field)
    * @constructor
    */
    var exports = function (mdlWellMarker, koSlcVwmWellMarker) {

        /** Alternative */
        var ths = this;

        /**
        * Model: well marker
        * @type {module:models/well-marker-of-map-of-wield}
        */
        this.mdlWellMarker = mdlWellMarker;

        /**
        * Whether well marker is selected
        * @type {boolean}
        */
        this.isSlc = ko.computed({
            read: function () {
                return ths === ko.unwrap(koSlcVwmWellMarker);
            },
            deferEvaluation: true
        });
    };

    return exports;
});