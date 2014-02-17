/** @module */
define([
		'jquery',
		'knockout',
		'helpers/modal-helper',
		'viewmodels/well',
		'viewmodels/bases/stage-child-base',
		'viewmodels/bases/stage-base',
		'viewmodels/wfm-parameter-of-wroup'],
	function (
		$,
		ko,
		modalHelper,
		VwmWell,
		VwmStageChildBase,
		VwmStageBase,
		VwmWfmParameterOfWroup) {

	'use strict';

	/**
	 * Well group view model
	 * @constructor
	 */
	var exports = function (mdlWroup, parentVwmWield, defaultSlcData) {
		var ths = this;

		this.mdlStage = mdlWroup;

		this.unq = mdlWroup.id;

		this.fmgr = parentVwmWield.fmgr;

		this.listOfVwmChild = ko.computed({
				read : function () {
					return ko.unwrap(mdlWroup.wells).map(function (elem) {
						return new VwmWell(elem, ths, defaultSlcData);
					});
				},
				deferEvaluation : true
			});

		// Has a children (wroups)
		VwmStageChildBase.call(this, defaultSlcData.wellId);
		// Has sections and widgets
		VwmStageBase.call(this, defaultSlcData.wroupSectionId, parentVwmWield.unqOfSlcVwmChild);

		this.selectAncestorVwms = function () {
			parentVwmWield.unqOfSlcVwmChild(ths.unq);
			parentVwmWield.selectAncestorVwms();
		};

		/**
		 * Create well
		 */
		this.postVwmWell = function () {
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

		this.removeVwmWfmParameterOfWroup = function (vwmToRemove) {
			var tmpName = ko.unwrap(ko.unwrap(vwmToRemove.mdlWfmParameterOfWroup.wfmParameter).name);
			if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + tmpName + '"?')) {
				ths.mdlStage.removeWfmParameterOfWroup(vwmToRemove.mdlWfmParameterOfWroup);
			}
		};

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
		 * A selected date for the monitoring section
		 *    By default: current date in unix time
		 * @type {string}
		 */
		this.monitoringUnixTime = ko.observable(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()) / 1000);

		/**
		 * Open well and select monitoring section
		 */
		this.goToMonitoringOfWell = function (tmpVwmWell) {
			// Select monitoring section
			tmpVwmWell.unzOfSlcVwmSectionWrk('well-monitoring');

			// Activate well view
			ths.activateVwmChild(tmpVwmWell);
		};

		/**
		 * Open this wroup and select monitoring section
		 */
		this.goToMonitoringOfWroup = function () {
			// Select monitoring section
			ths.unzOfSlcVwmSectionWrk('wroup-monitoring');

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
    this.turnOnMonthlyProcentView = function(){
        this.isMonthlyProcentView(true);
    };

    /**
    * Toggle between a values view and a montly procent view
    */
    this.turnOffMonthlyProcentView = function(){
        this.isMonthlyProcentView(false);
    };
    
		//} #endregion MONITORING
	};

	return exports;
});
