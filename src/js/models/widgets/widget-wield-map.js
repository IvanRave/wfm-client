/** @module */
define(['knockout', 'models/view-models/map-of-wield-vwm'], function (ko, MapOfWieldVwm) {
    'use strict';

    /** Well field map widget */
    var exports = function (opts, koMapsOfWield) {
        opts = opts || {};
        // TODO: calculate from koMapsOfWield using id
        console.log(koMapsOfWield);

        var koModel = ko.observable();
        ////var idOfMapOfWield = opts['IdOfMapOfWield'];
        ////if (idOfMapOfWield) {
        ////    // Find need model from all maps
        ////    console.log('id', idOfMapOfWield);

        ////}

        // Load all maps and select need, using option: mapId
        this.widgetVwm = new MapOfWieldVwm(koModel, opts);

        this.toPlainOpts = function () {
            var model = ko.unwrap(koModel);
            if (!model) { return {}; }
            return {
                'IdOfMapOfWield': model.id
                ////'StartDate': ko.unwrap(self.historyView['startDate']),
                ////'EndDate': ko.unwrap(self.historyView['endDate']),
                ////'SortByDateOrder': ko.unwrap(self.historyView['sortByDateOrder']),
                ////'JobTypeId': ko.unwrap(self.historyView['jobTypeId'])
            };
        };
    };

    return exports;
});