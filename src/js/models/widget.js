/** @module */
define(['knockout',
		'services/widget'], function (ko, widgetService) {
	'use strict';

	/**
	 * Widget: a base class for all widgets
	 * @constructor
	 */
	var exports = function (data, widgockItem) {
		var ths = this;
		data = data || {};

    /** Getter for a parent */
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
    * Widget options: filled in widget subclasses
    */
    this.opts = {};
    
		/**
		 * Widget template name: for summary - default summary section
		 * @type {string}
		 */
		this.widgetTpl = 'widget-tpl-' + (ths.idOfSectionPattern.indexOf('-summary') > 0 ? 'default-summary' : ths.idOfSectionPattern);
	};

  /** Save widget */
	exports.prototype.putWidget = function (scsCallback) {
		var ths = this;
    
		widgetService.put(ths.getWidgock().getWidgout().getParent().stageKey, ths.widgockId, ths.id, {
			id : ko.unwrap(ths.id),
			name : ko.unwrap(ths.name),
			idOfSectionPattern : ko.unwrap(ths.idOfSectionPattern),
			widgockId : ko.unwrap(ths.widgockId),
			orderNumber : ko.unwrap(ths.orderNumber),
			opts : this.toPlainOpts()
		}).done(scsCallback);
	};

	return exports;
});
