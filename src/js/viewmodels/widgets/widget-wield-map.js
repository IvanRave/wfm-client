﻿/** @module */
define(['knockout', 'viewmodels/map-of-wield'], function (ko, VwmMapOfWield) {
    'use strict';

    /**
    * Base: widget view model for map of well field 
    * @constuctor
    */
    var exports = function (opts, mdlWield) {
        opts = opts || {};

        var ths = this;

        var tmpTranslateAttr = {
            scale: opts['TransformScale'] || 1,
            translate: opts['TransformTranslate'] || [0, 0]
        };

        /**
        * Selected view map
        */
        this.slcVwmMapOfWield = ko.computed({
            read: function () {
                var tmpVid = ko.unwrap(ths.vidOfSlcVwmMapOfWield);
                if (tmpVid) {
                    var needVwm = ko.unwrap(ths.listOfVwmMapOfWield).filter(function (elem) {
                        return elem.vid === tmpVid;
                    })[0];

                    if (needVwm) {
                        if (tmpTranslateAttr) {
                            needVwm.transformAttr(tmpTranslateAttr);
                            // Remove default value to don't load again after selection new map
                            tmpTranslateAttr = null;
                        }

                        return needVwm;
                    }
                }
            },
            deferEvaluation: true
        });

        this.vidOfSlcVwmMapOfWield = ko.observable(opts['IdOfSlcMapOfWield']);

        /** List of maps for selection in widget settings */
        this.listOfVwmMapOfWield = ko.computed({
            read: function () {
                return ko.unwrap(mdlWield.WellFieldMaps).map(function (elem) {
                    return new VwmMapOfWield(elem, ths.vidOfSlcVwmMapOfWield);
                });
            },
            deferEvaluation: true
        });

        /** Whether name of map is visible */
        this.isVisName = ko.observable(opts['IsVisName']);

        /** Whether map is visible */
        this.isVisImg = ko.observable(opts['IsVisImg']);

        /** Convert to plain JSON to send to the server as widget settings */
        this.toStringifyOpts = function () {
            var tmpSlcVwm = ko.unwrap(ths.slcVwmMapOfWield);

            return JSON.stringify({
                'IdOfSlcMapOfWield': tmpSlcVwm ? tmpSlcVwm.vid : null,
                'IsVisName': ko.unwrap(ths.isVisName),
                'IsVisImg': ko.unwrap(ths.isVisImg),
                'TransformScale': tmpSlcVwm ? ko.unwrap(tmpSlcVwm.transformAttr).scale : null,
                'TransformTranslate': tmpSlcVwm ? ko.unwrap(tmpSlcVwm.transformAttr).translate : null
            });
        };
    };

    return exports;
});