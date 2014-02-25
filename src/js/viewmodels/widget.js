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
	 * Viewmodel: widget
	 * @constructor
	 */
	var exports = function (mdlWidget, vwmWidgock) {

		var ths = this;

		/**
		 * Model: widget
		 * @type {module:models/widget}
		 */
		this.mdlWidget = mdlWidget;

		this.getVwmWidgock = function () {
			return vwmWidgock;
		};

		this.isVisSettingPanel = ko.observable(false);

		this.showVisSettingPanel = function () {
			ths.isVisSettingPanel(true);
		};

		var widgetOpts = mdlWidget.widgetOpts;

		var tmpWidgetMdlStage = ths.mdlWidget.getWidgock().getWidgout().getParent();

		var tmpParentVwmStage = ths.getVwmWidgock().getVwmWidgout().getParentVwmStage();

		switch (mdlWidget.idOfSectionPattern) {
		case 'well-summary':
		case 'wroup-summary':
		case 'wield-summary':
		case 'wegion-summary':
		case 'company-summary':
			var tmpPropSpecList = ko.unwrap(tmpWidgetMdlStage.propSpecList);
			// No view properties in summary section
			VwmWidgetDefaultSummary.call(ths, widgetOpts, tmpPropSpecList);
			break;
		case 'well-perfomance':
			VwmWidgetWellPerfomance.call(ths, widgetOpts, tmpParentVwmStage);
			break;
    case 'well-monitoring':
      VwmWidgetWellMonitoring.call(ths, widgetOpts, tmpWidgetMdlStage);
      break;
		case 'well-history':
			VwmWidgetWellHistory.call(ths, widgetOpts, tmpParentVwmStage);
			break;
		case 'wield-map':
			VwmWidgetWieldMap.call(ths, widgetOpts, tmpWidgetMdlStage);
			break;
		case 'well-sketch':
			VwmWidgetWellSketch.call(ths, widgetOpts);
			break;
		}

		/** Save model through viewmodel */
		this.saveVwmWidget = function () {
			mdlWidget.putWidget(ths.toStringifyOpts(), function () {
				// Close settings after saving
				ths.isVisSettingPanel(false);
			});
		};
	};

	return exports;
});
