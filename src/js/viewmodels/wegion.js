/** @module */
define(['jquery',
		'knockout',
		'helpers/modal-helper',
		'helpers/app-helper',
		'viewmodels/wield',
		'base-viewmodels/stage-child-base',
		'base-viewmodels/stage-base'],
	function ($,
		ko,
		bootstrapModal,
		appHelper,
		VwmWield,
		VwmStageChildBase,
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
		this.defaultSlcData = defaultSlcData;

		/** Unique id for view */
		this.unq = this.mdlStage.id;

		/**
		 * Get a parent viewmodel
		 * @type {module:viewmodels/company}
		 */
		this.getParentVwm = function () {
			return parentVwmCompany;
		};

		/** Link to file manager of company */
		this.fmgr = parentVwmCompany.fmgr;

		/**
		 * List of views of well fields
		 * @type {Array.<module:viewmodels/wield>}
		 */
		this.listOfVwmChild = ko.computed({
				read : this.buildListOfVwmChild,
				deferEvaluation : true,
				owner : this
			});

		VwmStageChildBase.call(this, defaultSlcData.wieldId);
		VwmStageBase.call(this, defaultSlcData.wegionSectionId, parentVwmCompany.unqOfSlcVwmChild);
	};

	/** Inherit from a stage base viewmodel */
	appHelper.inherits(exports, VwmStageBase);

	/**
	 * Select all ancestor's view models
	 */
	exports.prototype.selectAncestorVwms = function () {
		// 1. take parent view - company
		// 2. take parent view of employee - userprofile
		this.getParentVwm().unqOfSlcVwmChild(this.unq);
		this.getParentVwm().selectAncestorVwms();
	};

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
			return new VwmWield(elem, this, this.defaultSlcData);
		}, this);
	};

	return exports;
});
