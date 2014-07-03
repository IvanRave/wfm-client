/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /**
    * Figure on image: arrow, line, text, etc.
    * @constructor
    */
    var exports = function (data) {
        data = data || {};

        /**
        * Figure id
        * @type {string}
        */
        this.id = data.Id;

        /**
        * Figure color in hex mode
        * @type {string}
        */
        this.color = ko.observable(data.Color);

        /**
        * Figure type, like 'arrow', 'line', 'text'
        * @type {string}
        */
        this.tpe = data.Tpe;

        /**
        * Options, specified for this figure
        */
        this.opts = ko.observable(JSON.parse(data.Opts));

        /** Convert to server data transfer object */
        this.toDto = function () {
            return {
                Id: this.id,
                Color: ko.unwrap(this.color),
                Tpe: ko.unwrap(this.tpe),
                Opts: JSON.stringify(ko.unwrap(this.opts))
            };
        };
    };

    return exports;
});