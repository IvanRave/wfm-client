/** @module */
define([
		'jquery',
		'knockout',
		'helpers/modal-helper',
		'helpers/app-helper',
		'viewmodels/well',
		'base-viewmodels/stage-child-base',
		'base-viewmodels/stage-base',
		'viewmodels/wfm-parameter-of-wroup'],
	function (
		$,
		ko,
		modalHelper,
		appHelper,
		VwmWell,
		VwmStageChildBase,
		VwmStageBase,
		VwmWfmParameterOfWroup) {

	'use strict';

	/**
	 * Well group view model
	 * @constructor
	 * @augments {module:base-viewmodels/stage-base}
	 */
	var exports = function (mdlWroup, parentVwmWield, defaultSlcData) {
		var ths = this;

		this.mdlStage = mdlWroup;

		this.getParentVwm = function () {
			return parentVwmWield;
		};

		this.unq = mdlWroup.id;

		this.fmgr = this.getParentVwm().fmgr;

		this.defaultSlcData = defaultSlcData;

		this.listOfVwmChild = ko.computed({
				read : this.buildListOfVwmChild,
				deferEvaluation : true,
				owner : this
			});

		// Has a children (wroups)
		VwmStageChildBase.call(this, defaultSlcData.wellId);
		// Has sections and widgets
		VwmStageBase.call(this, defaultSlcData.wroupSectionId, parentVwmWield.unqOfSlcVwmChild);

		/**
		 * List of viewmodels of wfm parameters of well group
		 * @type {Array.<module:viewmodels/wfm-parameter-of-wroup>}
		 */
		this.listOfVwmWfmParameterOfWroup = ko.computed({
				read : function () {
					return ko.unwrap(mdlWroup.listOfWfmParameterOfWroup).map(function (elem) {
						return new VwmWfmParameterOfWroup(elem);
					});
				},
				deferEvaluation : true
			});

		// WFM parameter which user select from unselected wfm parameter list (from root)
		this.selectedWfmParameterId = ko.observable();

		// wfm parameter from main source which is not in this group
		this.unselectedWfmParameterList = ko.computed({
				read : function () {
					// two dimensioanl array
					var tmpList = ko.unwrap(ths.mdlStage.getRootMdl().wfmParameterList);
					return $.grep(tmpList, function (prmElem) {
						var isParamExist = false;
						$.each(ko.unwrap(ths.mdlStage.listOfWfmParameterOfWroup), function (wlgIndex, wlgElem) {
							if (wlgElem.wfmParameterId === prmElem.id) {
								isParamExist = true;
								// break from arr
								return false;
							}
						});

						// return params which are not selected in this well group
						return !isParamExist;
					});
				},
				deferEvaluation : true
			});

		/**
		 * Add selected parameter to the main list
		 */
		this.addWellGroupWfmParameter = function () {
			var tmpWfmParamId = ko.unwrap(ths.selectedWfmParameterId);
			if (tmpWfmParamId) {
				ths.mdlStage.postWfmParameterOfWroup(tmpWfmParamId);
			}
		};

		//{ #region MONITORING

		/**
		 * List of monitoring params (params of wroup)
		 * @type {Array.<module:viewmodels/wfm-parameter-of-wroup>}
		 */
		this.listOfMonitoredVwmParams = ko.computed({
				read : function () {
					var tmpList = ko.unwrap(ths.listOfVwmWfmParameterOfWroup);

					return tmpList.filter(function (elem) {
						return ko.unwrap(elem.mdlWfmParameterOfWroup.isMonitored);
					});
				},
				deferEvaluation : true
			}).trackHasItems();

		/**
		 * A selected date for the monitoring section
		 *    By default: current date in unix time (set when the section is loaded)
		 * @type {string}
		 */
		this.monitoringUnixTime = ko.observable();

		/**
		 * Open well and select monitoring section
		 */
		this.goToMonitoringOfWell = function (tmpVwmWell) {
			// Select monitoring section
			tmpVwmWell.unzOfSlcVwmSectionWrk('well-monitoring');
			// Load content (this event is triggered when an user click to the section)
			tmpVwmWell.loadSectionContent('well-monitoring');

			// Activate well view
			ths.activateVwmChild(tmpVwmWell);
		};

		/**
		 * Open this wroup and select monitoring section
		 */
		this.goToMonitoringOfWroup = function () {
			// Select monitoring section
			ths.unzOfSlcVwmSectionWrk('wroup-monitoring');

			// Load content (this event is triggered when an user click to the section)
			ths.loadSectionContent('wroup-monitoring');

			// Activate this wroup
			parentVwmWield.activateVwmChild(ths);
		};

		/**
		 * Whether a current view (table) show montly procents
		 * @type {boolean}
		 */
		this.isMonthlyProcentView = ko.observable(false);

		/**
		 * Toggle between a values view and a montly procent view
		 */
		this.turnOnMonthlyProcentView = function () {
			this.isMonthlyProcentView(true);
		};

		/**
		 * Toggle between a values view and a montly procent view
		 */
		this.turnOffMonthlyProcentView = function () {
			this.isMonthlyProcentView(false);
		};

		/**
		 * Get monitoring records
		 *    after changing unix time
		 *    or count of wfm properties
		 *    or by generating new records from well
		 */
		this.reloadMonitoringRecords = function () {
			var tmpUnixTime = ko.unwrap(ths.monitoringUnixTime);
			if (tmpUnixTime) {
				var tmpListOfParams = ko.unwrap(ths.mdlStage.listOfMonitoredParams);

				if (tmpListOfParams.length > 0) {
					ths.mdlStage.loadListOfScopeOfMonitoring(tmpUnixTime, tmpListOfParams);
				}
			}
		};

		/**
		 * Load monitoring data when the user select some date
		 */
		this.monitoringUnixTime.subscribe(ths.reloadMonitoringRecords);

		/**
		 * Reload monitoring records when the user change monitoring parameters
		 */
		this.listOfMonitoredVwmParams.subscribe(ths.reloadMonitoringRecords);

		//} #endregion MONITORING
	};

	/** Inherit from a stage base viewmodel */
	appHelper.inherits(exports, VwmStageBase);

	exports.prototype.selectAncestorVwms = function () {
		this.getParentVwm().unqOfSlcVwmChild(this.unq);
		this.getParentVwm().selectAncestorVwms();
	};

	/**
	 * Create well
	 */
	exports.prototype.postVwmWell = function () {
		var ths = this;

		var inputName = document.createElement('input');
		inputName.type = 'text';
		$(inputName).prop({
			'required' : true
		}).addClass('form-control');

		var innerDiv = document.createElement('div');
		$(innerDiv).addClass('form-horizontal').append(modalHelper.gnrtDom('Name', inputName));

		function submitFunction() {
			var tmpName = $(inputName).val();
			if (tmpName) {
				ths.mdlStage.postWell(tmpName, function () {});
				modalHelper.closeModalWindow();
			}
		}

		modalHelper.openModalWindow('Well', innerDiv, submitFunction);
	};

	/**
	 * Set this section as selected
	 * @param {string} idOfSectionPattern - Id of a section pattern, like 'well-map'
	 */
	exports.prototype.loadSectionContent = function (idOfSectionPattern) {
		var ths = this;

		switch (idOfSectionPattern) {
		case 'wroup-unit':
			// Params (table headers)
			ths.mdlStage.loadListOfWfmParameterOfWroup();
			break;
		case 'wroup-potential':
			// Params (table headers)
			ths.mdlStage.loadListOfWfmParameterOfWroup();

			// Test data (table body)
			ko.unwrap(ths.mdlStage.wells).forEach(function (elem) {
				elem.loadListOfTestScope();
			});

			break;
		case 'wroup-monitoring':
			// Params (table headers)
			ths.mdlStage.loadListOfWfmParameterOfWroup();
			// - load list
			// - automatically creates list of monitoring parameters
			// - automatically loaded monitoring data (only for this well group)

			// Load procent borders
			ths.mdlStage.loadProcentBordersForAllWells();

			var prevUnixTime = ko.unwrap(ths.monitoringUnixTime);

			if (!prevUnixTime) {
				var curDate = new Date();
				var curUnixTime = Date.UTC(curDate.getFullYear(), curDate.getMonth(), curDate.getDate()) / 1000;

				prevUnixTime = curUnixTime;
			}

			// Reload data (set to null - then set to previous date (or current date if no previous date))
			ths.monitoringUnixTime(null);

			// Set the current date and
			//     automatically loaded monitoring values for this date
			ths.monitoringUnixTime(prevUnixTime);

			break;
		}
	};

	/**
	 * Remove a parameter
	 * @param {module:viewmodels/wfm-parameter-of-wroup}
	 */
	exports.prototype.removeVwmWfmParameterOfWroup = function (vwmToRemove) {
		// This (with bind($parent)) - vwmStage - vwmWroup
		// First param is current parameter (in foreach)
		var ths = this;

		console.log('Remove parameter {0} from {1}', vwmToRemove, this);

		var tmpName = ko.unwrap(ko.unwrap(vwmToRemove.mdlWfmParameterOfWroup.wfmParameter).name);
		if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + tmpName + '"?')) {
			ths.mdlStage.removeWfmParameterOfWroup(vwmToRemove.mdlWfmParameterOfWroup);
		}
	};

	/** Build a list of viewmodels of childs */
	exports.prototype.buildListOfVwmChild = function () {
		return ko.unwrap(this.mdlStage.wells).map(function (elem) {
			return new VwmWell(elem, this, this.defaultSlcData);
		}, this);
	};

	return exports;
});
