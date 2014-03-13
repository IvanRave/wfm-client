/** @module */
define(['knockout',
		'models/employee',
		'helpers/lang-helper',
		'services/company-user',
		'services/company',
		'helpers/history-helper',
		'services/auth',
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
		authService,
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

	/** Main properties for company: headers can be translated here if needed */
	var userProfilePropSpecList = [
		/**
		 * User email (name)
		 * @type {string}
		 */
		new PropSpec('email', 'Email', 'Email', 'SingleLine', {
			maxLength : 320
		})
	];

	/**
	 * User profile
	 * @constructor
	 * @param {object} data - User profile data
	 */
	var exports = function (data, rootMdl) {
		data = data || {};

		/** Alternative for this */
		var ths = this;

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

		/** User profile id (guid) */
		this.id = data.Id;

		/** Base for all stages: no server data in user profile */
		StageBase.call(ths, data);

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
		 * Load employee list for this user
		 */
		this.loadEmployees = function () {
			if (ko.unwrap(ths.isLoadedEmployees)) {
				return;
			}

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

		/**
		 * Name of a new company: user can create only one company with manager access level
		 * @type {string}
		 */
		this.nameOfCreatedCompany = ko.observable('');

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
				read : function () {
					var result = false;

					var tmpEmployees = ko.unwrap(ths.employees);

					tmpEmployees.forEach(function (arrElem) {
						if (ko.unwrap(arrElem.canManageAll)) {
							result = true;
						}
					});

					return result;
				},
				deferEvaluation : true
			});

		/** Stare to load inner data after creation user */
		this.loadEmployees();
	};

  /** Inherit from a stage base model */
	appHelper.inherits(exports, StageBase);
  
	return exports;
});
