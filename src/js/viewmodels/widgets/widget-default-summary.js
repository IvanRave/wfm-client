/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /*
    * Widget for summary info: for all stages
    * @constructor
    */
    var exports = function (opts, propSpecList) {
        var ths = this;
        opts = opts || {};

        propSpecList.forEach(function (propSpec) {
            // Properties without type not needed
            if (propSpec.tpe) {
                ths['isVis' + propSpec.clientId] = ko.observable(opts['IsVis' + propSpec.serverId]);
            }
        });

        this.toStringifyOpts = function () {
            var obj = {};

            propSpecList.forEach(function (propSpec) {
                if (propSpec.tpe) {
                    obj['IsVis' + propSpec.serverId] = ko.unwrap(ths['isVis' + propSpec.clientId]);
                }
            });

            return JSON.stringify(obj);
        };
    };

    return exports;
});