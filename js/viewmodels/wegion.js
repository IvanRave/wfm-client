/** @module */
define(['jquery',
		'knockout',
		'helpers/modal-helper',
		'helpers/app-helper',
		'viewmodels/wield',
		'base-viewmodels/stage-base'],
	function ($,
		ko,
		bootstrapModal,
		appHelper,
		VwmWield,
		VwmStageBase) {
	'use strict';

	/**
	 * Well region view model
	 * @constructor
	 * @augments {module:base-viewmodels/stage-base}
	 */
	var exports = function (mdlWegion, parentVwmCompany, defaultSlcData) {
		/**
		 * Model wegion
		 * @type {module:models/wegion}
		 */
		this.mdlStage = mdlWegion;

		/** Default data to select */
		this.defaultSlcData_ = defaultSlcData;

		/** Unique id for view */
		this.unq = this.mdlStage.id;

		/**
		 * Get a parent viewmodel
		 * @type {module:viewmodels/company}
		 */
		this.getParentVwm = function () {
			return parentVwmCompany;
		};

		VwmStageBase.call(this, this.defaultSlcData_.wegionSectionId, parentVwmCompany.unqOfSlcVwmChild, this.defaultSlcData_.wieldId);
	};

	/** Inherit from a stage base viewmodel */
	appHelper.inherits(exports, VwmStageBase);

	/** Add new well field model and viewmodel */
	exports.prototype.addVwmWield = function () {
		var ths = this;
		var inputName = document.createElement('input');
		inputName.type = 'text';
		$(inputName).prop({
			'required' : true
		}).addClass('form-control');

		var innerDiv = document.createElement('div');

		$(innerDiv).addClass('form-horizontal').append(
			bootstrapModal.gnrtDom('Name', inputName));

		function submitFunction() {
			ths.mdlStage.postWield($(inputName).val());
			bootstrapModal.closeModalWindow();
		}

		bootstrapModal.openModalWindow('Well field', innerDiv, submitFunction);
	};

	/**
	 * Build a list of viewmodels of childs
	 * @returns {module:viewmodels/wield}
	 */
	exports.prototype.buildListOfVwmChild = function () {
		return ko.unwrap(this.mdlStage.wields).map(function (elem) {
			return new VwmWield(elem, this, this.defaultSlcData_);
		}, this);
	};

	return exports;
});
