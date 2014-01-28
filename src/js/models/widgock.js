/** @module */
define(['jquery',
    'knockout',
    'services/widget',
    'models/widget'], function ($, ko, widgetService, Widget) {
        'use strict';

        // Well widget layout list
        function importWidgetList(data, widgockItem) {
            return (data || []).map(function (item) { return new Widget(item, widgockItem); });
        }

        /**
        * Widget block of widget layout; Widget layout divides to widget blocks; Widget block divibed to widgets
        * @param {object} data - Widget block data
        * @param {module:models/widgout} widgoutItem - Layout - parent of this widget block
        * @constructor
        */
        var exports = function (data, widgoutItem) {
            data = data || {};

            var ths = this;

            this.getWidgout = function () {
                return widgoutItem;
            };

            this.id = data.Id;
            this.orderNumber = ko.observable(data.OrderNumber);
            this.columnCount = ko.observable(data.ColumnCount);

            this.columnStyle = ko.computed({
                read: function () {
                    return 'col-md-' + ko.unwrap(ths.columnCount);
                },
                deferEvaluation: true
            });

            this.widgetList = ko.observableArray();

            this.addWidget = function (tmpWidgetName, tmpIdOfSectionPattern, scsCallback) {
                var tmpWidgetList = ko.unwrap(ths.widgetList);

                // Get order number of last widget
                var lastOrderNumber;

                if (tmpWidgetList.length > 0) {
                    lastOrderNumber = ko.unwrap(tmpWidgetList[tmpWidgetList.length - 1].orderNumber);
                }
                else {
                    lastOrderNumber = 0;
                }

                widgetService.post(ths.getWidgout().getParent().stageKey, ths.id, {
                    Name: tmpWidgetName,
                    IdOfSectionPattern: tmpIdOfSectionPattern,
                    OrderNumber: lastOrderNumber + 1,
                    Opts: '{}',
                    WidgockId: ths.id
                }).done(function (createdWidget) {
                    var widgetNew = new Widget(createdWidget, ths);
                    ths.widgetList.push(widgetNew);

                    // Open settings after creation
                    scsCallback(widgetNew.id);
                });
            };

            /** Remove widget from widget block */
            this.removeWidget = function (widgetToDelete) {
                widgetService.remove(ths.getWidgout().getParent().stageKey, ths.id, widgetToDelete.id).done(function () {
                    ths.widgetList.remove(widgetToDelete);
                });
            };

            this.widgetList(importWidgetList(data.WidgetDtoList, ths));
        };

        return exports;
    });