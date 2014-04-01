/** @module */
define(['knockout',
		'services/widget'], function (ko, widgetService) {
	'use strict';

	/**
	 * Widget: a base class for all widgets
	 * @constructor
	 */
	var exports = function (data, widgockItem, mdlStageContext) {
		data = data || {};

    /** Getter for a parent */
		this.getWidgock = function () {
			return widgockItem;
		};
    
    this.mdlStageContext = mdlStageContext;

		/**
    * Widget id
    * @type {string}
    */
		this.id = data.Id;
		this.name = ko.observable(data.Name);
		this.idOfSectionPattern = data.IdOfSectionPattern;
		this.widgockId = data.WidgockId;
		this.orderNumber = ko.observable(data.OrderNumber);
    
    /**
    * Widget options: filled in widget subclasses
    */
    this.opts = {};
    
		/**
		 * Widget template name: for summary - default summary section
		 * @type {string}
		 */
		this.widgetTpl = 'widget-tpl-' + (this.idOfSectionPattern.indexOf('-summary') > 0 ? 'default-summary' : this.idOfSectionPattern);
	};

  /** Save widget */
	exports.prototype.putWidget = function (scsCallback) {
		widgetService.put(this.getWidgock().getWidgout().getParent().stageKey, this.widgockId, this.id, {
			id : ko.unwrap(this.id),
			name : ko.unwrap(this.name),
			idOfSectionPattern : ko.unwrap(this.idOfSectionPattern),
			widgockId : ko.unwrap(this.widgockId),
			orderNumber : ko.unwrap(this.orderNumber),
			opts : this.toPlainOpts()
		}).done(scsCallback);
	};

	return exports;
});
