/** @module */
define(['knockout',
		'constants/stage-constants',
		'services/widget',
		'models/widget-default-summary',
		'models/widget-well-history',
		'models/widget-well-map',
		'models/widget-well-monitoring',
		'models/widget-well-perfomance',
		'models/widget-well-sketch',
		'models/widget-wield-map'],
	function (ko,
		stageCnst,
		widgetService,
		MdlWidgetDefaultSummary,
		MdlWidgetWellHistory,
		MdlWidgetWellMap,
		MdlWidgetWellMonitoring,
		MdlWidgetWellPerfomance,
		MdlWidgetWellSketch,
		MdlWidgetWieldMap) {
	'use strict';

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
				read : this.calcColumnStyle,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * A list of widgets
		 */
		this.widgetList = ko.observableArray([]);

		// Fill a widget list
		this.importWidgetList(data.WidgetDtoList);
	};

	/** Fill the well widget layout list */
	exports.prototype.importWidgetList = function (data) {
		this.widgetList((data || []).map(this.buildWidget, this));
	};

	/**
	 * Calc a column style
	 * @returns {string}
	 */
	exports.prototype.calcColumnStyle = function () {
		return 'col-md-' + ko.unwrap(this.columnCount);
	};

	/** Remove a widget from a widget block */
	exports.prototype.removeWidget = function (widgetToDelete) {
		widgetService.remove(this.getWidgout().getParent().stageKey, this.id, widgetToDelete.id)
		.done(this.removeWidgetFromList.bind(this, widgetToDelete));
	};

	/** Remove a widget from the main list */
	exports.prototype.removeWidgetFromList = function (widgetToDelete) {
		this.widgetList.remove(widgetToDelete);
		// Some message or some changes in a view
	};

	/** Create a widget */
	exports.prototype.addWidget = function (tmpWidgetName, 
    tmpIdOfSectionPattern, 
    tmpIdOfCntxStage,
    scsCallback) {
		var tmpWidgetList = ko.unwrap(this.widgetList);

		// Get order number of last widget
		var lastOrderNumber;

		if (tmpWidgetList.length > 0) {
			lastOrderNumber = ko.unwrap(tmpWidgetList[tmpWidgetList.length - 1].orderNumber);
		} else {
			lastOrderNumber = 0;
		}

    var tmpParentStage = this.getWidgout().getParent();
    
		widgetService.post(tmpParentStage.stageKey, this.id, {
			Name : tmpWidgetName,
			IdOfSectionPattern : tmpIdOfSectionPattern,
			OrderNumber : lastOrderNumber + 1,
			Opts : '{}',
			WidgockId : this.id,
      IdOfCntxStage: tmpIdOfCntxStage
		}).done(scsCallback);
	};

	/**
	 * Create a model for a widget from widget data
	 */
	exports.prototype.buildWidget = function (widgetData) {
		var widgockItem = this;

		switch (widgetData.IdOfSectionPattern) {
		case stageCnst.well.ptrn.summary:
		case stageCnst.wroup.ptrn.summary:
		case stageCnst.wield.ptrn.summary:
		case stageCnst.wegion.ptrn.summary:
		case stageCnst.company.ptrn.summary:
			return new MdlWidgetDefaultSummary(widgetData, widgockItem);
		case stageCnst.well.ptrn.perfomance:
			return new MdlWidgetWellPerfomance(widgetData, widgockItem);
		case stageCnst.well.ptrn.monitoring:
			return new MdlWidgetWellMonitoring(widgetData, widgockItem);
		case stageCnst.well.ptrn.history:
			return new MdlWidgetWellHistory(widgetData, widgockItem);
		case stageCnst.well.ptrn.map:
			return new MdlWidgetWellMap(widgetData, widgockItem);
		case stageCnst.well.ptrn.sketch:
			return new MdlWidgetWellSketch(widgetData, widgockItem);
		case stageCnst.wield.ptrn.map:
			return new MdlWidgetWieldMap(widgetData, widgockItem);
		}
	};

	return exports;
});
