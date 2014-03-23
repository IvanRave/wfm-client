/** @module */
define(['jquery',
		'knockout',
		'services/widget',
		'models/widget-default-summary',
		'models/widget-well-history',
		'models/widget-well-map',
		'models/widget-well-monitoring',
		'models/widget-well-perfomance',
		'models/widget-well-sketch',
		'models/widget-wield-map'],
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
		case 'wroup-summary':
		case 'wield-summary':
		case 'wegion-summary':
		case 'company-summary':
			return new MdlWidgetDefaultSummary(widgetData, widgockItem);
		case 'well-summary':
			return new MdlWidgetDefaultSummary(widgetData, widgockItem);
		case 'well-perfomance':
			return new MdlWidgetWellPerfomance(widgetData, widgockItem);
		case 'well-monitoring':
			return new MdlWidgetWellMonitoring(widgetData, widgockItem);
		case 'well-history':
			return new MdlWidgetWellHistory(widgetData, widgockItem);
		case 'well-map':
			return new MdlWidgetWellMap(widgetData, widgockItem);
		case 'well-sketch':
			return new MdlWidgetWellSketch(widgetData, widgockItem);
		case 'wield-map':
			return new MdlWidgetWieldMap(widgetData, widgockItem);
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

		/**
		 * Getter for a parent (widget layout)
		 * @returns {module:models/widgout}
		 */
		this.getWidgout = function () {
			return widgoutItem;
		};

		/**
		 * An id of a widget block
		 * @type {string}
		 */
		this.id = data.Id;

		/**
		 * An order number of the block
		 * @type {number}
		 */
		this.orderNumber = ko.observable(data.OrderNumber);

		/**
		 * A number of the column, when placed this block
		 * @type {number}
		 */
		this.columnCount = ko.observable(data.ColumnCount);

		/**
		 * A css class for this block
		 * @type {string}
		 */
		this.columnStyle = ko.computed({
				read : function () {
					return 'col-md-' + ko.unwrap(this.columnCount);
				},
				deferEvaluation : true,
				owner : this
			});

		/**
		 * A list of widgets
		 */
		this.widgetList = ko.observableArray();

		// Fill a widget list
		this.widgetList(importWidgetList(data.WidgetDtoList, this));
	};

	/** Remove widget from widget block */
	exports.prototype.removeWidget = function (widgetToDelete) {
		var ths = this;
		widgetService.remove(ths.getWidgout().getParent().stageKey, ths.id, widgetToDelete.id).done(function () {
			ths.widgetList.remove(widgetToDelete);
		});
	};

	/** Create a widget */
	exports.prototype.addWidget = function (tmpWidgetName, tmpIdOfSectionPattern, scsCallback) {
		var tmpWidgetList = ko.unwrap(this.widgetList);

		// Get order number of last widget
		var lastOrderNumber;

		if (tmpWidgetList.length > 0) {
			lastOrderNumber = ko.unwrap(tmpWidgetList[tmpWidgetList.length - 1].orderNumber);
		} else {
			lastOrderNumber = 0;
		}

		var ths = this;

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

	return exports;
});
