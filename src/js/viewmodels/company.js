/** @module */
define(['knockout',
		'helpers/app-helper',
		'viewmodels/wegion',
		'base-viewmodels/stage-base',
		'viewmodels/fmgr-modal'],
	function (ko,
		appHelper,
		VwmWegion,
		VwmStageBase,
		FmgrModal) {
	'use strict';

	/**
	 * Company view model
	 * @constructor
	 * @augments {module:base-viewmodels/stage-base}
	 */
	var exports = function (mdlCompany, vwmUproParent, defaultSlcData) {

		/** Getter for a parent viewmodel */
		this.getParentVwm = function () {
			return vwmUproParent;
		};

		/**
		 * Company data model
		 * @type {module:models/company}
		 */
		this.mdlStage = mdlCompany;

		this.unq = this.mdlStage.id;

		/**
		 * File manager as modal window for this view: created from modalFileMgr
		 * @type {module:viewmodels/fmgr-modal}
		 */
		this.fmgr = new FmgrModal();

		/**
		 * Default values for selection
		 * @private
		 */
		this.defaultSlcData_ = defaultSlcData;

		/**
		 * Base for all stages: with selected view of wegion
		 */
		VwmStageBase.call(this, this.defaultSlcData_.companySectionId, vwmUproParent.unqOfSlcVwmChild, this.defaultSlcData_.wegionId);
	};

	/** Inherit from a stage base viewmodel */
	appHelper.inherits(exports, VwmStageBase);

	/** Build a list of children */
	exports.prototype.buildListOfVwmChild = function () {
		var tmpListOfMdlWegion = ko.unwrap(this.mdlStage.wegions);
		return tmpListOfMdlWegion.map(function (elem) {
			return new VwmWegion(elem, this, this.defaultSlcData_);
		}, this);
	};

	return exports;
});
