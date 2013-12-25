/** @module */
define(['jquery', 'knockout',
    'services/datacontext',
    'models/widgets/widget-perfomance',
    'models/widgets/widget-summary',
    'models/widgets/widget-sketch',
    'models/widgets/widget-history'
], function ($, ko, appDatacontext, WidgetPerfomance, WidgetSummary, WidgetSketch, WidgetHistory) {
    'use strict';

    /**
    * Widget
    * @constructor
    */
    var exports = function (data, widgockItem) {
        var ths = this;
        data = data || {};

        this.getWidgock = function () {
            return widgockItem;
        };

        // Properties
        this.id = data.Id;
        this.name = ko.observable(data.Name);
        this.idOfSectionPattern = data.IdOfSectionPattern;
        this.widgockId = data.WidgockId;
        this.orderNumber = ko.observable(data.OrderNumber);

        this.widgetTpl = ths.idOfSectionPattern + '-widget-tpl';

        this.isVisSettingPanel = ko.observable(false);

        this.showVisSettingPanel = function () {
            ths.isVisSettingPanel(true);
        };

        this.putWidget = function () {
            appDatacontext.putWidget(ths.widgockId, ths.id, ths.toPlainJson()).done(function () {
                ths.isVisSettingPanel(false);
            });
        };

        var optsObj = JSON.parse(data.Opts);

        switch (this.idOfSectionPattern) {
            case 'well-perfomance':
                WidgetPerfomance.call(ths, optsObj, ths.getWidgock());
                break;
            case 'well-summary':
                WidgetSummary.call(ths, optsObj, ko.unwrap(ths.getWidgock().getWidgout().getParent().propSpecList));
                break;
            case 'well-sketch':
                WidgetSketch.call(ths, optsObj);
                break;
            case 'well-history':
                WidgetHistory.call(ths, optsObj, ths.getWidgock().getWidgout().getParent().historyList);
                break;
        }

        this.toPlainJson = function () {
            return {
                id: ko.unwrap(ths.id),
                name: ko.unwrap(ths.name),
                idOfSectionPattern: ko.unwrap(ths.idOfSectionPattern),
                widgockId: ko.unwrap(ths.widgockId),
                orderNumber: ko.unwrap(ths.orderNumber),
                opts: JSON.stringify(ths.toPlainOpts())
            };
        };
    };

    return exports;
});