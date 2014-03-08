/** @module */
define(['knockout',
		'viewmodels/widgets/widget-default-summary',
		'viewmodels/widgets/widget-well-perfomance',
		'viewmodels/widgets/widget-well-monitoring',
		'viewmodels/widgets/widget-well-sketch',
		'viewmodels/widgets/widget-well-history',
		'viewmodels/widgets/widget-wield-map'],
	function (ko,
		VwmWidgetDefaultSummary,
		VwmWidgetWellPerfomance,
		VwmWidgetWellMonitoring,
		VwmWidgetWellSketch,
		VwmWidgetWellHistory,
		VwmWidgetWieldMap) {
	'use strict';

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
		 * @type {Array.<module:viewmodels/widget>}
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
		var ths = this;

		var tmpWidgetMdlStage = ths.mdlWidgock.getWidgout().getParent();
		var tmpParentVwmStage = ths.getVwmWidgout().getParentVwmStage();

		return ko.unwrap(ths.mdlWidgock.widgetList).map(function (elem) {
			var widgetOpts = elem.widgetOpts;

			switch (elem.idOfSectionPattern) {
			case 'well-summary':
			case 'wroup-summary':
			case 'wield-summary':
			case 'wegion-summary':
			case 'company-summary':
				var tmpPropSpecList = ko.unwrap(tmpWidgetMdlStage.propSpecList);
				// No view properties in summary section
				return new VwmWidgetDefaultSummary(elem, widgetOpts, tmpPropSpecList);
			case 'well-perfomance':
				return new VwmWidgetWellPerfomance(elem, widgetOpts, tmpParentVwmStage);
			case 'well-monitoring':
				return new VwmWidgetWellMonitoring(elem, widgetOpts, tmpWidgetMdlStage, tmpParentVwmStage.getParentVwm().mdlStage.listOfMonitoredParams);
			case 'well-history':
				return new VwmWidgetWellHistory(elem, widgetOpts, tmpParentVwmStage);
			case 'wield-map':
				return new VwmWidgetWieldMap(elem, widgetOpts, tmpWidgetMdlStage);
			case 'well-sketch':
				return new VwmWidgetWellSketch(elem, widgetOpts);
			}
		});
	};

	return exports;
});
