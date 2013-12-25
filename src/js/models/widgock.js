/** @module */
define(['jquery', 'knockout', 'services/datacontext', 'models/widget', 'helpers/app-helper'], function ($, ko, appDatacontext, Widget, appHelper) {
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

        this.sectionIdList = ['well-summary', 'well-perfomance', 'well-sketch', 'well-history'];

        this.selectedSectionId = ko.observable();

        this.addWidget = function () {
            var sectionId = ko.unwrap(ths.selectedSectionId);
            if (sectionId) {
                var tmpWidgetList = ko.unwrap(ths.widgetList);
                // Get order number of last widget
                var lastOrderNumber;

                if (tmpWidgetList.length > 0) {
                    lastOrderNumber = ko.unwrap(tmpWidgetList[tmpWidgetList.length - 1].orderNumber);
                }
                else {
                    lastOrderNumber = 0;
                }

                appDatacontext.postWidget(ths.id, {
                    Name: appHelper.capitalizeFirst(sectionId),
                    IdOfSectionPattern: sectionId,
                    OrderNumber: lastOrderNumber + 1,
                    Opts: '{}',
                    WidgockId: ths.id
                }).done(function (createdWidget) {
                    var widgetNew = new Widget(createdWidget, ths);
                    ths.widgetList.push(widgetNew);
                    widgetNew.showVisSettingPanel();
                });
            }
        };

        this.deleteWidget = function (widgetToDelete) {
            if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(widgetToDelete.name) + '"?')) {
                appDatacontext.deleteWidget(widgetToDelete.widgockId, widgetToDelete.id).done(function () {
                    ths.widgetList.remove(widgetToDelete);
                });
            }
        };

        this.widgetList(importWidgetList(data.WidgetDtoList, ths));
    };

    return exports;
});