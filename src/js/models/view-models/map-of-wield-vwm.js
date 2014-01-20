/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /**
    * Well field map view model
    * @constructor
    */
    var exports = function (koModel, opts) {
        console.log(opts);

        /** Alternative for this */
        var ths = this;

        this.model = koModel;

        this.mapWrap = {};

        this.mapWrap.ratio = 1 / 2;

        this.mapWrap.width = ko.observable();

        // actual height of map wrap and y-axis
        this.mapWrap.height = ko.computed({
            read: function () {
                var tmpWidth = ko.unwrap(ths.mapWrap.width);
                if (tmpWidth) {
                    return tmpWidth * ths.mapWrap.ratio;
                }
            },
            deferEvaluation: true
        });
    };

    return exports;
});