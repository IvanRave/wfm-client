/** @module */
define(['knockout',
		'viewmodels/widget-default-summary',
		'viewmodels/widget-well-perfomance',
		'viewmodels/widget-well-monitoring',
		'viewmodels/widget-well-sketch',
		'viewmodels/widget-well-history',
		'viewmodels/widget-wield-map',
		'viewmodels/widget-well-map'],
	function (ko,
		VwmWidgetDefaultSummary,
		VwmWidgetWellPerfomance,
		VwmWidgetWellMonitoring,
		VwmWidgetWellSketch,
		VwmWidgetWellHistory,
		VwmWidgetWieldMap,
		VwmWidgetWellMap) {
	'use strict';

  /** Create a viewmodel for a widget from a widget model */
	function buildVwmWidget(elem, tmpParentVwmStage) {
		switch (elem.idOfSectionPattern) {
		case 'well-summary':
		case 'wroup-summary':
		case 'wield-summary':
		case 'wegion-summary':
		case 'company-summary':
			return new VwmWidgetDefaultSummary(elem);
		case 'well-perfomance':
			return new VwmWidgetWellPerfomance(elem, tmpParentVwmStage);
		case 'well-monitoring':
			return new VwmWidgetWellMonitoring(elem, tmpParentVwmStage);
		case 'well-history':
			return new VwmWidgetWellHistory(elem, tmpParentVwmStage);
		case 'wield-map':
			return new VwmWidgetWieldMap(elem);
		case 'well-map':
			return new VwmWidgetWellMap(elem);
		case 'well-sketch':
			return new VwmWidgetWellSketch(elem);
		}
	}

	/**
	 * Viewmodel: widget block
	 * @constructor
	 */
	var exports = function (mdlWidgock, vwmWidgout) {
		/**
		 * Model: widget block for this view
		 * @type {module:models/widgock}
		 */
		this.mdlWidgock = mdlWidgock;

		/**
		 * Getter for the parent layout
		 */
		this.getVwmWidgout = function () {
			return vwmWidgout;
		};

		/**
		 * List of viewmodels of widgets
		 */
		this.listOfVwmWidget = ko.computed({
				read : this.getListOfVwmWidget,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Selected section pattern for widget (of this stage)
		 * @type {module:models/section-pattern}
		 */
		this.slcStagePatternForWidget = ko.observable();
	};

	/**
	 * Add a viewmodel for a widget
	 */
	exports.prototype.addVwmWidget = function () {
		var ths = this;
		var tmpStagePattern = ko.unwrap(ths.slcStagePatternForWidget);
		if (tmpStagePattern) {
			ths.mdlWidgock.addWidget(ko.unwrap(tmpStagePattern.name), tmpStagePattern.id, function (idOfCreatedWidget) {
				// Find created widget
				var createdVwmWidget = ko.unwrap(ths.listOfVwmWidget).filter(function (elem) {
						return elem.mdlWidget.id === idOfCreatedWidget;
					})[0];

				// Open settings
				if (createdVwmWidget) {
					createdVwmWidget.showVisSettingPanel();
				}
			});
		}
	};

	/**
	 * Remove the widget model and viewmodel
	 */
	exports.prototype.removeVwmWidget = function (vwmWidgetToRemove) {
		var ths = this;
		var tmpMdl = vwmWidgetToRemove.mdlWidget;
		if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(tmpMdl.name) + '"?')) {
			ths.mdlWidgock.removeWidget(tmpMdl);
		}
	};

	/**
	 * Get all viewmodels for widgets
	 */
	exports.prototype.getListOfVwmWidget = function () {
		var tmpParentVwmStage = this.getVwmWidgout().getParentVwmStage();

		return ko.unwrap(this.mdlWidgock.widgetList).map(function (elem) {
			return buildVwmWidget(elem, tmpParentVwmStage);
		});
	};

	return exports;
});
