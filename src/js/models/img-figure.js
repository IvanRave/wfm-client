/** @module */
define(['knockout', 'constants/img-figure-type-constants'], function (ko, tpeConstants) {
    'use strict';

    /**
    * Figure on image: arrow, line, text, etc.
    * @constructor
    * @type {object} data - Figure data from server
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

        this.startX = ko.observable(data.StartX);
        this.startY = ko.observable(data.StartY);
        this.lastX = ko.observable(data.LastX);
        this.lastY = ko.observable(data.LastY);

        if (this.tpe === tpeConstants.arrowFigure.id) {
            // call arrow
        }
        else if (this.tpe === tpeConstants.lineFigure.id) {
            // call line
        }
        else if (this.tpe === tpeConstants.textFigure.id) {
            // call text
        }
        else {
            throw new Error('noSuchType');
        }

        /** Convert to server data transfer object */
        this.toDto = function () {
            return {
                Id: this.id,
                Color: ko.unwrap(this.color),
                Tpe: ko.unwrap(this.tpe),
                StartX: ko.unwrap(this.startX),
                StartY: ko.unwrap(this.startY),
                LastX: ko.unwrap(this.lastX),
                LastY: ko.unwrap(this.lastY)
            };
        };
    };

    return exports;
});