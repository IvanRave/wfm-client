/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /**
    * Viewmodel: widget for sketch (image plus desc)
    * @constructor
    */
    var exports = function (opts) {
        var ths = this;
        opts = opts || {};

        this.isVisImg = ko.observable(opts['IsVisImg']);
        this.isVisDescription = ko.observable(opts['IsVisDescription']);

        /** Convert to plain JSON to send to the server as widget settings */
        this.toStringifyOpts = function () {
            return JSON.stringify({
                'IsVisImg': ko.unwrap(ths.isVisImg),
                'IsVisDescription': ko.unwrap(ths.isVisDescription)
            });
        };
    };

    return exports;
});