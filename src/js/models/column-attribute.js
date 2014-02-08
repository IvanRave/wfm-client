/** @module */
define(['jquery', 'knockout'], function ($, ko) {
    'use strict';

    /**
    * Model: column attribute
    * @constructor
    * @param {object} data - Attribute data
    */
    var exports = function (data) {
        var self = this;
        data = data || {};

        self.Id = data.Id;
        self.Name = data.Name;
        self.Format = ko.observable(data.Format);

        self.numeratorList = data.NumeratorList;
        
        /*
        * Copy of num list
        * @todo: fix remove links from perfomace-of-well and delete #MM!
        */
        self.NumeratorList = data.NumeratorList;
        
        self.denominatorList = data.DenominatorList;
        
        /*
        * Copy of denom list
        * @todo: fix remove links from perfomace-of-well and delete #MM!
        */
        self.DenominatorList = data.DenominatorList;
        // properties
        self.Title = data.Title || '';

        self.Group = data.Group || null;

        self.IsVisible = ko.observable(data.IsVisible || false);

        self.IsCalc = ko.observable(data.IsCalc || false);

        self.AssId = data.AssId;

        self.curveColor = data.CurveColor;

        self.GraphCurveId = ko.observable();

        var trackIsVisible = function () {
            if (self.IsVisible() === true) {
                $('.class' + self.Name).removeClass('hidden');
            }
            else {
                $('.class' + self.Name).addClass('hidden');
            }
        };

        self.IsVisible.subscribe(trackIsVisible);

        self.turnCheck = function () {
            self.IsVisible(!self.IsVisible());
        };

        self.convertUom = function (uomName) {
            self.Format(uomName);
        };

        self.toPlainJson = function () {
            return ko.toJS(self);
        };
    };

    return exports;
});