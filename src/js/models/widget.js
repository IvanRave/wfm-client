/** @module */
define(['knockout',
    'services/widget',
    'models/widgets/widget-well-perfomance',
    'models/widgets/widget-default-summary',
    'models/widgets/widget-well-sketch',
    'models/widgets/widget-well-history',
    'models/widgets/widget-wield-map'
], function (ko, widgetService, WidgetWellPerfomance, WidgetDefaultSummary, WidgetWellSketch, WidgetWellHistory, WidgetWieldMap) {
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

        /**
        * Widget template name: for summary - default summary section
        * @type {string}
        */
        this.widgetTpl = 'widget-tpl-' + (ths.idOfSectionPattern.indexOf('-summary') > 0 ? 'default-summary' : ths.idOfSectionPattern);

        this.isVisSettingPanel = ko.observable(false);

        this.showVisSettingPanel = function () {
            ths.isVisSettingPanel(true);
        };

        this.putWidget = function () {
            widgetService.put(ths.getWidgock().getWidgout().getParent().stageKey, ths.widgockId, ths.id, ths.toPlainJson()).done(function () {
                ths.isVisSettingPanel(false);
            });
        };

        var optsObj = JSON.parse(data.Opts);

        switch (this.idOfSectionPattern) {
            case 'well-summary':
            case 'wroup-summary':
            case 'wield-summary':
            case 'wegion-summary':
            case 'company-summary':
                // One default summary widget for all stages
                WidgetDefaultSummary.call(ths, optsObj, ko.unwrap(ths.getWidgock().getWidgout().getParent().propSpecList));
                break;
            case 'well-perfomance':
                WidgetWellPerfomance.call(ths, optsObj, ths.getWidgock());
                break;
            case 'well-sketch':
                WidgetWellSketch.call(ths, optsObj);
                break;
            case 'well-history':
                WidgetWellHistory.call(ths, optsObj, ths.getWidgock().getWidgout().getParent().historyList);
                break;
            case 'wield-map':
                WidgetWieldMap.call(ths, optsObj, ths.getWidgock().getWidgout().getParent().WellFieldMaps);
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