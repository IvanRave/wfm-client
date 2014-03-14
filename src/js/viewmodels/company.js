/** @module */
define(['knockout',
		'helpers/app-helper',
		'viewmodels/wegion',
		'base-viewmodels/stage-base'],
	function (ko,
		appHelper,
		VwmWegion,
		VwmStageBase) {
	'use strict';

	/**
	 * Company view model
	 * @constructor
	 * @augments {module:base-viewmodels/stage-base}
	 */
	var exports = function (mdlCompany, vwmUproParent, defaultSlcData) {

		/** Alternative of this */
		var ths = this;

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

		/** File manager as modal window for this view: created from modalFileMgr */
		this.fmgr = {
			isOpen : ko.observable(false),
			okDescription : ko.observable(''),
			okError : ko.observable(''),
			// Callback for Ok button
			okCallback : ko.observable(),
			// When click from view using data-bind click event, then first argument - it is context
			show : function () {
				// TODO: add ok callback description: 'choose map file...'
				ths.fmgr.isOpen(true);
			},
			hide : function () {
				ths.fmgr.isOpen(false);
			},
			hiddenCallback : function () {
				ths.fmgr.isOpen(false);
				ths.fmgr.okDescription('');
				ths.fmgr.okError('');
				ths.fmgr.okCallback(null);
			}
		};

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
