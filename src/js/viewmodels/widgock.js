/** @module */
define(['knockout',
		'constants/stage-constants',
		'viewmodels/widget-default-summary',
		'viewmodels/widget-well-perfomance',
		'viewmodels/widget-well-monitoring',
		'viewmodels/widget-well-sketch',
		'viewmodels/widget-well-history',
		'viewmodels/widget-wield-map',
		'viewmodels/widget-well-map',
		'viewmodels/widget-wield-stat'],
	function (ko,
		stageCnst,
		VwmWidgetDefaultSummary,
		VwmWidgetWellPerfomance,
		VwmWidgetWellMonitoring,
		VwmWidgetWellSketch,
		VwmWidgetWellHistory,
		VwmWidgetWieldMap,
		VwmWidgetWellMap,
		VwmWidgetWieldStat) {
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
		 */
		this.listOfVwmWidget = ko.computed({
				read : this.getListOfVwmWidget,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * All stage keys
		 */
		this.dictOfKeyOfStage = [{
				optValue : stageCnst.company.id,
				optText : stageCnst.company.single
			}, {
				optValue : stageCnst.wegion.id,
				optText : stageCnst.wegion.single
			}, {
				optValue : stageCnst.wield.id,
				optText : stageCnst.wield.single
			}, {
				optValue : stageCnst.wroup.id,
				optText : stageCnst.wroup.single
			}, {
				optValue : stageCnst.well.id,
				optText : stageCnst.well.single
			}
		];

		/**
		 * A selected key of stage for a new widget
		 *    By default: current stage key
		 * @type {string}
		 */
		this.slcKeyOfStage = ko.observable(this.mdlWidgock.getWidgout().getParent().stageKey);

		/**
		 * Section patterns for the selected key of a stage
		 * @type {Array.<module:models/section-pattern>}
		 */
		this.listOfPatternOfSection = ko.computed({
				read : this.calcListOfPatternOfSection,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Selected section pattern for widget (of this stage)
		 * @type {module:models/section-pattern}
		 */
		this.slcStagePatternForWidget = ko.observable(null);

		/**
		 * Whether user can add a new widget
		 * @type {boolean}
		 */
		this.canAddVwmWidget = ko.computed({
				read : this.calcCanAddVwmWidget,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * A dict of stages
		 * @type {Array.<Object>}
		 */
		this.dictOfStage = ko.computed({
				read : this.calcDictOfStage,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Selected context (a stage)
		 *    When user add a widget from other stage
		 * @type {string}
		 */
		this.slcCntxStage = ko.observable(null);
	};

	/**
	 * Calculate a dict of stages
	 * @returns {Array.<Object>}
	 */
	exports.prototype.calcDictOfStage = function () {
		var tmpKeyOfStage = ko.unwrap(this.slcKeyOfStage);
		var resultDict = [];

		if (tmpKeyOfStage) {
			// find stage by key
			var needArr = this.mdlWidgock.getWidgout().getParent().getListOfStageByKey(tmpKeyOfStage);

			resultDict = needArr.map(function (elem) {
					return {
						optValue : elem, // full element
						optText : ko.unwrap(elem.name) || ko.unwrap(elem.Name)
					};
				});
		}

		return resultDict;
	};

	/**
	 * Calc a list of section patterns for selected stage key
	 * @type {module:models/section-pattern}
	 */
	exports.prototype.calcListOfPatternOfSection = function () {
		var tmpAllPatterns = ko.unwrap(this.mdlWidgock.getWidgout().getParent().getRootMdl().ListOfSectionPatternDto);

		var tmpSlcKeyOfStage = ko.unwrap(this.slcKeyOfStage);

		return tmpAllPatterns.filter(this.isPat.bind(this, tmpSlcKeyOfStage));
	};

	/**
	 * Whether the key of pattern equals key of a stage
	 *    only for widget
	 * @returns {boolean}
	 */
	exports.prototype.isPat = function (tmpKeyOfStage, tmpPattern) {
		return ((tmpPattern.idOfStage === tmpKeyOfStage) && (tmpPattern.isWidget === true));
	};

	/**
	 * Whether the user can add a new widget
	 * @returns {boolean}
	 */
	exports.prototype.calcCanAddVwmWidget = function () {
		if (ko.unwrap(this.slcStagePatternForWidget)) {
			if (ko.unwrap(this.slcCntxStage)) {
				return true;
			}
		}

		return false;
	};

	/**
	 * Add a viewmodel for a widget
	 */
	exports.prototype.addVwmWidget = function () {
		var tmpStagePattern = ko.unwrap(this.slcStagePatternForWidget);
		if (tmpStagePattern) {
			// Clean old value, to possible future adding
			// Clean only the section selection
			this.slcStagePatternForWidget(null);

			var tmpSlcCntxStage = ko.unwrap(this.slcCntxStage);

			var tmpIdOfSlcCntxStage = tmpSlcCntxStage.id;

			if (tmpIdOfSlcCntxStage) {
				// This is a hack for company GUIDs and other stage INTEGERS ids
				var typeOfCntxStage = tmpStagePattern.id.split('-')[0]; // 'wegion'; //'company';

				if (typeOfCntxStage !== 'company') {
					tmpIdOfSlcCntxStage = parseInt(tmpIdOfSlcCntxStage); //6002;
				}

				// Name of added widget, like Summary WellName
				var tmpNameOfFutureWidget = (ko.unwrap(tmpSlcCntxStage.name) || ko.unwrap(tmpSlcCntxStage.Name)) +
				' ' + ko.unwrap(tmpStagePattern.name);

				this.mdlWidgock.addWidget(tmpNameOfFutureWidget,
					tmpStagePattern.id,
					tmpIdOfSlcCntxStage,
					this.afterAddingVwmWidget.bind(this));
			}

			// Destroy used objects
			tmpSlcCntxStage = null;
		}
	};

	/**
	 * Find and open a setting panel
	 */
	exports.prototype.afterAddingVwmWidget = function (createdWidgetData) {
		var widgetNew = this.mdlWidgock.buildWidget(createdWidgetData);
		this.mdlWidgock.widgetList.push(widgetNew);

		// Open settings after creation
		var idOfCreatedWidget = widgetNew.id;

		// Find created widget
		var createdVwmWidget = ko.unwrap(this.listOfVwmWidget).filter(function (elem) {
				return elem.mdlWidget.id === idOfCreatedWidget;
			})[0];

		// Open settings
		if (createdVwmWidget) {
			createdVwmWidget.showVisSettingPanel();
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
		return ko.unwrap(this.mdlWidgock.widgetList).map(this.buildVwmWidget, this);
	};

	/** Create a viewmodel for a widget from a widget model */
	exports.prototype.buildVwmWidget = function (mdlWidget) {
		var tmpParentVwmStage = this.getVwmWidgout().getParentVwmStage();

		switch (mdlWidget.idOfSectionPattern) {
		case stageCnst.well.ptrn.summary:
		case stageCnst.wroup.ptrn.summary:
		case stageCnst.wield.ptrn.summary:
		case stageCnst.wegion.ptrn.summary:
		case stageCnst.company.ptrn.summary:
			return new VwmWidgetDefaultSummary(mdlWidget, tmpParentVwmStage);
		case stageCnst.well.ptrn.perfomance:
			return new VwmWidgetWellPerfomance(mdlWidget, tmpParentVwmStage);
		case stageCnst.well.ptrn.monitoring:
			return new VwmWidgetWellMonitoring(mdlWidget, tmpParentVwmStage);
		case stageCnst.well.ptrn.history:
			return new VwmWidgetWellHistory(mdlWidget, tmpParentVwmStage);
		case stageCnst.wield.ptrn.map:
			return new VwmWidgetWieldMap(mdlWidget, tmpParentVwmStage);
    case stageCnst.wield.ptrn.stat:
			return new VwmWidgetWieldStat(mdlWidget, tmpParentVwmStage);
		case stageCnst.well.ptrn.map:
			return new VwmWidgetWellMap(mdlWidget, tmpParentVwmStage);
		case stageCnst.well.ptrn.sketch:
			return new VwmWidgetWellSketch(mdlWidget, tmpParentVwmStage);
		}
	};

	return exports;
});
