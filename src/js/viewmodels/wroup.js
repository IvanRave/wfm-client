/** @module */
define([
		'jquery',
		'knockout',
		'viewmodels/well',
		'viewmodels/bases/stage-child-base',
		'viewmodels/bases/stage-base',
		'viewmodels/wfm-parameter-of-wroup'],
	function (
		$,
		ko,
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
	};

	return exports;
});
