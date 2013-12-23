/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /*
    * Widget for summary well info
    * @constructor
    */
    var exports = function (opts, propSpecList) {
        var ths = this;
        opts = opts || {};

        propSpecList.forEach(function (propSpec) {
            ths['isVis' + propSpec.clientId] = ko.observable(opts['IsVis' + propSpec.serverId]);
        });

        this.toPlainOpts = function () {
            var obj = {};

            propSpecList.forEach(function (propSpec) {
                obj['IsVis' + propSpec.serverId] = ko.unwrap(ths['isVis' + propSpec.clientId]);
            });

            return obj;
        };
    };

    return exports;
});