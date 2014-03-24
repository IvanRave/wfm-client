/** @module */
define(['knockout',
		'constants/stage-constants',
		'viewmodels/widget-default-summary',
		'viewmodels/widget-well-perfomance',
		'viewmodels/widget-well-monitoring',
		'viewmodels/widget-well-sketch',
		'viewmodels/widget-well-history',
		'viewmodels/widget-wield-map',
		'viewmodels/widget-well-map'],
	function (ko,
		stageCnst,
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
		case stageCnst.well.ptrn.summary:
		case stageCnst.wroup.ptrn.summary:
		case stageCnst.wield.ptrn.summary:
		case stageCnst.wegion.ptrn.summary:
		case stageCnst.company.ptrn.summary:
			return new VwmWidgetDefaultSummary(elem);
		case stageCnst.well.ptrn.perfomance:
			return new VwmWidgetWellPerfomance(elem, tmpParentVwmStage);
		case stageCnst.well.ptrn.monitoring:
			return new VwmWidgetWellMonitoring(elem, tmpParentVwmStage);
		case stageCnst.well.ptrn.history:
			return new VwmWidgetWellHistory(elem, tmpParentVwmStage);
		case stageCnst.wield.ptrn.map:
			return new VwmWidgetWieldMap(elem);
		case stageCnst.well.ptrn.map:
			return new VwmWidgetWellMap(elem);
		case stageCnst.well.ptrn.sketch:
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
		var tmpMdl = vwmWidgetToRemove.mdlWidget;
		if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(tmpMdl.name) + '"?')) {
			this.mdlWidgock.removeWidget(tmpMdl);
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
