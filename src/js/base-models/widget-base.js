/** @module */
define(['knockout',
		'services/widget'], function (ko, widgetService) {
	'use strict';

	/**
	 * Widget: a base class for all widgets
	 * @constructor
	 */
	var exports = function (data, widgockItem) {
		data = data || {};

		/** Getter for a parent */
		this.getWidgock = function () {
			return widgockItem;
		};

		/**
		 * Widget id
		 * @type {string}
		 */
		this.id = data.Id;
		this.name = ko.observable(data.Name);
		this.idOfSectionPattern = data.IdOfSectionPattern;
		this.widgockId = data.WidgockId;
		this.orderNumber = ko.observable(data.OrderNumber);

		var typeOfCntxStage = this.idOfSectionPattern.split('-')[0]; // 'wegion'; //'company';

    // This is a hack for company GUIDs and other stage INTEGERS ids
		if (typeOfCntxStage !== 'company') {
			this.idOfCntxStage = parseInt(data.IdOfCntxStage); //6002;
		} else {
			this.idOfCntxStage = data.IdOfCntxStage; // 'd14f9c04-4875-4519-9acb-dfe6046355e0';
		}

		/**
		 * A context of a stage model.
		 *     Need for cases, where user adds widget on other stages
		 * @type {Object}
		 */
		this.mdlStageContext = this.getWidgock().getWidgout().getParent().findCognateStage(typeOfCntxStage, this.idOfCntxStage);

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
			idOfCntxStage : this.idOfCntxStage,
			opts : this.toPlainOpts()
		}).done(scsCallback);
	};

	return exports;
});
