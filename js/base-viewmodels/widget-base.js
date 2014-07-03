/** @module */
define(['knockout',
		'constants/stage-constants'], function (ko,
		stageCnst) {
	'use strict';

	/**
	 * Viewmodel: a base viewmodel for widgets
	 * @constructor
	 */
	var exports = function (mdlWidget) {
		/**
		 * Model: widget
		 * @type {module:base-models/widget-base}
		 */
		this.mdlWidget = mdlWidget;

		/**
		 * Whether the setting panel is visible
		 * @type {boolean}
		 */
		this.isVisSettingPanel = ko.observable(false);
	};

	/** Save model through viewmodel */
	exports.prototype.saveVwmWidget = function () {
		this.mdlWidget.putWidget(this.hideVisSettingPanel.bind(this));
	};

	/** Hide a setting panel */
	exports.prototype.hideVisSettingPanel = function () {
		this.isVisSettingPanel(false);
	};

	/** Show setting panel */
	exports.prototype.showVisSettingPanel = function () {
		this.isVisSettingPanel(true);
	};

	/**
	 * Callback for rendering widgets
	 */
	exports.prototype.afterRenderWidget = function () {
		var tmpMdlStage = this.mdlWidget.mdlStageContext;

		switch (this.mdlWidget.idOfSectionPattern) {
		case stageCnst.wield.ptrn.map:
			tmpMdlStage.loadMapsOfWield();
			break;
		case stageCnst.well.ptrn.map:
			tmpMdlStage.getWellGroup().getWellField().loadMapsOfWield();
			break;
		case stageCnst.well.ptrn.sketch:
			tmpMdlStage.sketchOfWell.load();
			break;
		case stageCnst.well.ptrn.perfomance:
			tmpMdlStage.getWellGroup().loadListOfWfmParameterOfWroup();
			tmpMdlStage.perfomanceOfWell.forecastEvolution.getDict();
			tmpMdlStage.perfomanceOfWell.getHstProductionDataSet();
			break;
		case stageCnst.well.ptrn.monitoring:
			tmpMdlStage.getWellGroup().loadListOfWfmParameterOfWroup(this.widgetVwmMonitoringOfWell.loadFilteredListOfMonitoringRecord.bind(this.widgetVwmMonitoringOfWell));
			//tmpMdlStage.getWellGroup().loadProcentBordersForAllWells();
			//this.widgetVwmMonitoringOfWell.loadFilteredListOfMonitoringRecord();
			break;
		case stageCnst.well.ptrn.history:
			tmpMdlStage.loadWellHistoryList();
			break;
		}

		// // this.getWellGroup().loadListOfWfmParameterOfWroup();
		// // this.perfomanceOfWell.forecastEvolution.getDict();
		// // this.perfomanceOfWell.getHstProductionDataSet();

		// Destroy temp object
		tmpMdlStage = null;
	};

	return exports;
});
