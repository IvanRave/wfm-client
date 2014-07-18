/** @module */
define(['knockout',
		'viewmodels/employee',
		'helpers/app-helper',
		'base-viewmodels/stage-base'],
	function (ko,
		VwmEmployee,
		appHelper,
		VwmStageBase) {
	'use strict';

	/**
	 * User profile (can be as a guest - without logon)
	 * @constructor
	 * @param {object} defaultSlcData - Ids of models, which need to select automatically
	 */
	var exports = function (mdlUserProfile, defaultSlcData) {

		/**
		 * Default data to select
		 * @type {Object}
		 * @private
		 */
		this.defaultSlcData_ = defaultSlcData;

		/**
		 * No parent in userprofile: need only for StageBase behavior
		 */
		this.getParentVwm = function () {
			return null;
		};

		// 1. Create model
		// 2.1 Create viewmodel, using model
		// 2.2 Start to load data to model (all employees)

		/**
		 * Link to user profile data model
		 * @type {module:models/user-profile}
		 */
		this.mdlStage = mdlUserProfile;

		/**
		 * Unique value of this viewmodel (user profile's guid)
		 * @type {string}
		 */
		this.unq = this.mdlStage.id; // undefined for security, but need for structure

    /** User name */
    this.uname = this.mdlStage.uname;
    
		// 1. null - No default data to selection  (only one per website)
		// 2. If no other userprofiles then this upro is selected always
		VwmStageBase.call(this, null, ko.observable(this.unq), this.defaultSlcData_.companyId);

		// Other stagebase view
		// Has no sections and widgets - StageChildBase
		// Has no parent with few user profiles - StageParentBase

		/** Start to load inner data after creation user */
		this.mdlStage.loadEmployees();
	};

	/** Inherit from a stage base viewmodel */
	appHelper.inherits(exports, VwmStageBase);

	/** Build a list of children */
	exports.prototype.buildListOfVwmChild = function () {
		var listOfMdlEmployee = ko.unwrap(this.mdlStage.employees);
		return listOfMdlEmployee.map(function (elem) {
			return new VwmEmployee(elem, this, this.defaultSlcData_);
		}, this);
	};

	return exports;
});
