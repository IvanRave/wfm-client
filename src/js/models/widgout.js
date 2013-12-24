/** @module */
define(['knockout', 'models/widgock', 'services/widgout'], function (ko, Widgock, widgoutService) {
    'use strict';

    /** Import widget block list to layout */
    function importWidgockList(data, widgoutItem) {
        return (data || []).map(function (item) { return new Widgock(item, widgoutItem); });
    }

    /**
    * Widget layout
    * @constructor
    */
    var exports = function (data, parent) {
        var ths = this;
        data = data || {};

        this.getParent = function () {
            return parent;
        };

        this.id = data.Id;
        this.name = ko.observable(data.Name);

        this.save = function () {
            // Get well id as parent
            var tmpStageId = ths.getParent().Id || ths.getParent().id;

            widgoutService.put('well', tmpStageId, ths.id, {
                id: ths.id,
                name: ko.unwrap(ths.name)
            });
        };

        this.name.subscribe(ths.save);

        // Well widget block list
        this.widgockList = ko.observableArray();

        this.widgockList(importWidgockList(data.WidgockDtoList, ths));
    };

    return exports;
});