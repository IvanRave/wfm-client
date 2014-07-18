/** @module */
define(['knockout',
		'models/employee',
		'helpers/lang-helper',
		'services/company-user',
		'services/company',
		'helpers/history-helper',
		'constants/stage-constants',
		'models/prop-spec',
		'base-models/stage-base',
		'helpers/app-helper'],
	function (ko,
		Employee,
		langHelper,
		companyUserService,
		companyService,
		historyHelper,
		stageConstants,
		PropSpec,
		StageBase,
		appHelper) {
	'use strict';

	/** Import employees for this user */
	function importEmployees(data, userProfileItem) {
		return data.map(function (item) {
			return new Employee(item, userProfileItem);
		});
	}

	// second property - roles (usually for wfm-admin cab)
	/** Main properties for company: headers can be translated here if needed */
	var userProfilePropSpecList = [
		/**
		 * User name
		 * @type {string}
		 */
		new PropSpec('uname', 'uname', 'uname', 'SingleLine', {
			maxLength : 255
		})
	];

	/**
	 * User profile
	 * @constructor
	 * @augments {module:base-models/stage-base}
	 * @param {object} data - User profile data
	 */
	var exports = function (data, rootMdl) {
		data = data || {};

		/**
		 * Stage key: user profile
		 * @type {string}
		 */
		this.stageKey = stageConstants.upro.id;

		this.getRootMdl = function () {
			return rootMdl;
		};

		/** Main observable properties of user profile */
		this.propSpecList = userProfilePropSpecList;

		/** Base for all stages: no server data in user profile */
		StageBase.call(this, data);

		/**
		 * User can be in many companies with access level for each company
		 * @type {Array.<module:models/employee>}
		 */
		this.employees = ko.observableArray();

		/**
		 * Whether employees are loaded
		 * @type {boolean}
		 */
		this.isLoadedEmployees = ko.observable(false);

		/**
		 * Name of a new company: user can create only one company with manager access level
		 * @type {string}
		 */
		this.nameOfCreatedCompany = ko.observable('');

    /** Alternative for this */
		var ths = this;
    
		/** Add new employee with company */
		this.postEmployee = function () {
			// Post employee company
			var tmpNameOfCreatedCompany = ko.unwrap(ths.nameOfCreatedCompany);
			if (tmpNameOfCreatedCompany) {
				companyService.post({
					'Name' : tmpNameOfCreatedCompany,
					'Description' : ''
				}).done(function () {
					// Reload all companies:
					// by default - only one company (created company) for manage
					// and other - for view and/or edit
					ths.isLoadedEmployees(false);
					ths.loadEmployees();
				});
			}
		};

		/**
		 * Whether user is owner already: block link "register company"
		 * @type {boolean}
		 */
		ths.isOwnerAlready = ko.computed({
				read : this.calcIsOwnerAlready,
				deferEvaluation : true,
				owner : this
			});
	};

	/** Inherit from a stage base model */
	appHelper.inherits(exports, StageBase);

	/** Calculate - whether this user is owner of some company */
	exports.prototype.calcIsOwnerAlready = function () {
		var result = false;

		ko.unwrap(this.employees).forEach(function (arrElem) {
			if (ko.unwrap(arrElem.canManageAll)) {
				result = true;
			}
		});

		return result;
	};

	/**
	 * Load employee list for this user
	 */
	exports.prototype.loadEmployees = function () {
		if (ko.unwrap(this.isLoadedEmployees)) {
			return;
		}

		var ths = this;
		companyUserService.getCompanyUserList().done(function (response) {

			////// Set hash, add to history
			////historyHelper.pushState('/companies');

			ths.employees(importEmployees(response, ths));
			ths.isLoadedEmployees(true);

			////if (tmpInitialUrlData.companyId) {
			////    emplArray.forEach(function (arrElem) {
			////        if (arrElem.companyId === tmpInitialUrlData.companyId) {
			////            // Select employee = select company
			////            ths.selectEmployee(arrElem);
			////            // Clean from initial url data to don't select again
			////            delete tmpInitialUrlData.companyId;
			////            rootMdl.initialUrlData(tmpInitialUrlData);
			////        }
			////    });
			////}
		});
	};

	/** Remove company with employee */
	exports.prototype.removeChild = function (companyToRemove) {
		var ths = this;
		var tmpCompanyId = ko.unwrap(companyToRemove.id);
		companyService.remove(tmpCompanyId).done(function () {
			// Reload all employees
			ths.isLoadedEmployees(false);
			ths.loadEmployees();
		});
	};

	return exports;
});
