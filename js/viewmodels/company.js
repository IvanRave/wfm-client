/** @module */
define(['jquery',
		'knockout',
		'helpers/app-helper',
		'helpers/modal-helper',
		'viewmodels/wegion',
		'base-viewmodels/stage-base'],
	function ($,
		ko,
		appHelper,
		modalHelper,
		VwmWegion,
		VwmStageBase) {
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

	/**
	 * Open a window to add well region
	 */
	exports.prototype.prePostVwmWegion = function () {
		var inputName = document.createElement('input');
		inputName.type = 'text';
		var jqrInput = $(inputName);
		jqrInput.prop({
			'required' : true
		}).addClass('form-control');

		var innerDiv = document.createElement('div');
		$(innerDiv).addClass('form-horizontal').append(
			modalHelper.gnrtDom('Name', inputName));

		modalHelper.openModalWindow('Well region',
			innerDiv,
			this.postVwmWegion.bind(this, jqrInput));
	};

	exports.prototype.postVwmWegion = function (jqrInput) {
		this.mdlStage.postWegion(jqrInput.val(), this.successPostVwmWegion.bind(this));
	};

	exports.prototype.successPostVwmWegion = function (dataOfWegion) {
		this.mdlStage.pushWegion(dataOfWegion);
		modalHelper.closeModalWindow();
	};

	return exports;
});
