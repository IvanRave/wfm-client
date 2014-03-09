/** @module */
define(['jquery',
		'knockout',
		'services/widget',
		'models/widgets/widget-default-summary',
		'models/widgets/widget-well-history',
		'models/widgets/widget-well-map',
		'models/widgets/widget-well-monitoring',
		'models/widgets/widget-well-perfomance',
		'models/widgets/widget-well-sketch',
		'models/widgets/widget-wield-map'],
	function ($,
		ko,
		widgetService,
		MdlWidgetDefaultSummary,
		MdlWidgetWellHistory,
		MdlWidgetWellMap,
		MdlWidgetWellMonitoring,
		MdlWidgetWellPerfomance,
		MdlWidgetWellSketch,
		MdlWidgetWieldMap) {
	'use strict';

	/** Create a model for a widget from widget data */
	function buildWidget(widgetData, widgockItem) {
		switch (widgetData.IdOfSectionPattern) {
		case 'well-summary':
		case 'wroup-summary':
		case 'wield-summary':
		case 'wegion-summary':
		case 'company-summary':
			return new MdlWidgetDefaultSummary(widgetData, widgockItem);
		case 'well-perfomance':
			return new MdlWidgetWellPerfomance(widgetData, widgockItem);
		case 'well-monitoring':
			return new MdlWidgetWellMonitoring(widgetData, widgockItem);
		case 'well-history':
			return new MdlWidgetWellHistory(widgetData, widgockItem);
		case 'wield-map':
			return new MdlWidgetWieldMap(widgetData, widgockItem);
		case 'well-map':
			return new MdlWidgetWellMap(widgetData, widgockItem);
		case 'well-sketch':
			return new MdlWidgetWellSketch(widgetData, widgockItem);
		}
	}

	/** Fill the well widget layout list */
	function importWidgetList(data, widgockItem) {
		return (data || []).map(function (item) {
      return buildWidget(item, widgockItem);
		});
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
				read : function () {
					return 'col-md-' + ko.unwrap(ths.columnCount);
				},
				deferEvaluation : true
			});

		this.widgetList = ko.observableArray();

		this.addWidget = function (tmpWidgetName, tmpIdOfSectionPattern, scsCallback) {
			var tmpWidgetList = ko.unwrap(ths.widgetList);

			// Get order number of last widget
			var lastOrderNumber;

			if (tmpWidgetList.length > 0) {
				lastOrderNumber = ko.unwrap(tmpWidgetList[tmpWidgetList.length - 1].orderNumber);
			} else {
				lastOrderNumber = 0;
			}

			widgetService.post(ths.getWidgout().getParent().stageKey, ths.id, {
				Name : tmpWidgetName,
				IdOfSectionPattern : tmpIdOfSectionPattern,
				OrderNumber : lastOrderNumber + 1,
				Opts : '{}',
				WidgockId : ths.id
			}).done(function (createdWidgetData) {
				var widgetNew = buildWidget(createdWidgetData, ths);
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
