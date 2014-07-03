/** @module */
define([
		'jquery',
		'knockout',
		'helpers/modal-helper',
		'helpers/app-helper',
		'viewmodels/well',
		'base-viewmodels/stage-base',
		'viewmodels/wfm-parameter-of-wroup'],
	function (
		$,
		ko,
		modalHelper,
		appHelper,
		VwmWell,
		VwmStageBase,
		VwmWfmParameterOfWroup) {

	'use strict';

	// Private static methods

	var calcListOfMonitoredVwmParams = function (koList) {
		return ko.unwrap(koList).filter(function (elem) {
			return ko.unwrap(elem.mdlWfmParameterOfWroup.isMonitored);
		});
	};

	/**
	 * Well group view model
	 * @constructor
	 * @augments {module:base-viewmodels/stage-base}
	 */
	var exports = function (mdlWroup, parentVwmWield, defaultSlcData) {
		this.mdlStage = mdlWroup;

		this.getParentVwm = function () {
			return parentVwmWield;
		};

		this.unq = mdlWroup.id;

		this.defaultSlcData = defaultSlcData;

		// Has sections and widgets
		VwmStageBase.call(this, defaultSlcData.wroupSectionId, parentVwmWield.unqOfSlcVwmChild, defaultSlcData.wellId);

		/**
		 * List of viewmodels of wfm parameters of well group
		 * @type {Array.<module:viewmodels/wfm-parameter-of-wroup>}
		 */
		this.listOfVwmWfmParameterOfWroup = ko.computed({
				read : this.calcListOfVwmWfmParameterOfWroup,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * WFM parameter which user select from unselected wfm parameter list (from root)
		 */
		this.slcWfmParameter = ko.observable();

		// wfm parameter from main source which is not in this group
		this.unselectedWfmParameterList = ko.computed({
				read : this.calcUnselectedWfmParameterList,
				deferEvaluation : true,
				owner : this
			});

		//{ #region MONITORING

		/**
		 * List of monitoring params (params of wroup)
		 * @type {Array.<module:viewmodels/wfm-parameter-of-wroup>}
		 */
		this.listOfMonitoredVwmParams = ko.computed({
				read : calcListOfMonitoredVwmParams.bind(null, this.listOfVwmWfmParameterOfWroup),
				deferEvaluation : true,
				owner : true
			}).trackHasItems();

		/**
		 * A selected date for the monitoring section
		 *    By default: current date in unix time (set when the section is loaded)
		 * @type {string}
		 */
		this.monitoringUnixTime = ko.observable();

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
		 * Load monitoring data when the user select some date
		 */
		this.monitoringUnixTime.subscribe(this.reloadMonitoringRecords, this);

		/**
		 * Reload monitoring records when the user change monitoring parameters
		 */
		this.listOfMonitoredVwmParams.subscribe(this.reloadMonitoringRecords, this);

		//} #endregion MONITORING
	};

	/** Inherit from a stage base viewmodel */
	appHelper.inherits(exports, VwmStageBase);

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
		if (confirm('Are you sure you want to delete "' + tmpName + '"?')) {
			ths.mdlStage.removeWfmParameterOfWroup(vwmToRemove.mdlWfmParameterOfWroup);
		}
	};

	/** Build a list of viewmodels of childs */
	exports.prototype.buildListOfVwmChild = function () {
		return ko.unwrap(this.mdlStage.wells).map(function (elem) {
			return new VwmWell(elem, this, this.defaultSlcData);
		}, this);
	};

	/**
	 * Add selected parameter to the main list
	 */
	exports.prototype.addWellGroupWfmParameter = function () {
		var tmpWfmParam = ko.unwrap(this.slcWfmParameter);

		if (tmpWfmParam) {
			this.mdlStage.postWfmParameterOfWroup(tmpWfmParam.id,
				ko.unwrap(tmpWfmParam.defaultColor),
				ko.unwrap(tmpWfmParam.uom));
		}
	};

	/**
	 * Calc a group parameters
	 * @private
	 */
	exports.prototype.calcListOfVwmWfmParameterOfWroup = function () {
		return ko.unwrap(this.mdlStage.listOfWfmParameterOfWroup).map(function (elem) {
			return new VwmWfmParameterOfWroup(elem);
		});
	};

	/**
	 * Func for upper filtering
	 * @private
	 */
	var calcUnselectedItem = function (listOfParams, prmElem) {
		var isParamExist = false;
		listOfParams.forEach(function (wlgElem) {
			if (wlgElem.wfmParameterId === prmElem.id) {
				isParamExist = true;
				// break from arr
				//return false;
			}
		});

		// return params which are not selected in this well group
		return !isParamExist;
	};

	/**
	 * Calc unchoosed parameters
	 * @private
	 */
	exports.prototype.calcUnselectedWfmParameterList = function () {
		// two dimensioanl array
		return ko.unwrap(this.mdlStage.getRootMdl().wfmParameterList)
		.filter(calcUnselectedItem.bind(null, ko.unwrap(this.mdlStage.listOfWfmParameterOfWroup)));
	};

	/**
	 * Open well and select monitoring section
	 */
	exports.prototype.goToMonitoringOfWell = function (tmpVwmWell) {
		// Select monitoring section
		tmpVwmWell.unzOfSlcVwmSectionWrk('well-monitoring');
		// Load content (this event is triggered when an user click to the section)
		tmpVwmWell.loadSectionContent('well-monitoring');

		// Activate well view
		this.activateVwmChild(tmpVwmWell);
	};

	/**
	 * Open this wroup and select monitoring section
	 */
	exports.prototype.goToMonitoringOfWroup = function () {
		// Select monitoring section
		this.unzOfSlcVwmSectionWrk('wroup-monitoring');

		// Load content (this event is triggered when an user click to the section)
		this.loadSectionContent('wroup-monitoring');

		// Activate this wroup
		this.getParentVwm().activateVwmChild(this);
	};

	/**
	 * Get monitoring records
	 *    after changing unix time
	 *    or count of wfm properties
	 *    or by generating new records from well
	 */
	exports.prototype.reloadMonitoringRecords = function () {
		var tmpUnixTime = ko.unwrap(this.monitoringUnixTime);
		if (tmpUnixTime) {
			var tmpListOfParams = ko.unwrap(this.mdlStage.listOfMonitoredParams);

			if (tmpListOfParams.length > 0) {
				this.mdlStage.loadListOfScopeOfMonitoring(tmpUnixTime, tmpListOfParams);
			}
		}
	};

	return exports;
});
