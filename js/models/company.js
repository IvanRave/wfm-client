/**
 * @module
 * @todo #42! Allow only jpg and png as a logo
 */
define(['jquery',
		'knockout',
		'models/wegion',
		'models/job-type',
		'services/datacontext',
		'helpers/modal-helper',
		'helpers/history-helper',
		'base-models/stage-base',
		'models/section-of-stage',
		'models/prop-spec',
		'services/company',
		'models/file-spec',
		'services/wegion',
		'constants/stage-constants',
		'helpers/app-helper',
		'helpers/knockout-lazy'],
	function ($,
		ko,
		Wegion,
		JobType,
		appDatacontext,
		modalHelper,
		historyHelper,
		StageBase,
		SectionOfCompany,
		PropSpec,
		companyService,
		FileSpec,
		wegionService,
		stageCnst,
		appHelper) {
	'use strict';

	/** Import well regions for company */
	function importWegions(data, companyParent) {
		return (data || []).map(function (item) {
			return new Wegion(item, companyParent);
		});
	}

	/** Import company sections */
	function importListOfSectionOfCompanyDto(data, parent) {
		return (data || []).map(function (item) {
			return new SectionOfCompany(item, parent, item.CompanyId);
		});
		// item.CompanyId === parent.id
	}

	/** Main properties for company: headers can be translated here if needed */
	var companyPropSpecList = [
		new PropSpec('name', 'Name', 'Company name', 'SingleLine', {
			maxLength : 255
		}),
		new PropSpec('description', 'Description', 'Company description', 'MultiLine', {}),
		new PropSpec('fileSpecOfLogo', 'FileSpecOfLogo', 'Company logo', 'FileLine', {
			width : 100,
			// Client id of property of nested id of file spec
			nestedClientId : 'idOfFileSpecOfLogo'
		}),
		new PropSpec('idOfFileSpecOfLogo', 'IdOfFileSpecOfLogo', '', '', {})
	];

	/**
	 * Company model
	 * @constructor
	 * @param {object} data - Company data
	 */
	var exports = function (data, mdlEmployee) {
		data = data || {};

		this.getRootMdl = function () {
			return mdlEmployee.getRootMdl();
		};

		/**
		 * Company guid
		 * @type {string}
		 */
		this.id = data.Id;

		/** Props specifications */
		this.propSpecList = companyPropSpecList;

		/**
		 * Stage key: equals file name
		 * @type {string}
		 */
		this.stageKey = stageCnst.company.id;

		/** Base for all stages */
		StageBase.call(this, data);

		/**
		 * List of well regions
		 * @type {module:models/wegion}
		 */
		this.wegions = ko.observableArray();

		/**
		 * Whether well regions are loaded
		 * @type {boolean}
		 */
		this.isLoadedWegions = ko.observable(false);

		this.jobTypeList = ko.lazyObservableArray(this.loadJobTypeList, this);

		/** Load sections */
		this.listOfSection(importListOfSectionOfCompanyDto(data.ListOfSectionOfCompanyDto, this));

		/** Load inner object after initialization: only one time per user profile selection */
		this.loadWegions();
	};

	/** Inherit from a stage base model */
	appHelper.inherits(exports, StageBase);

	/** Convert to data transfer object to sent to the server*/
	exports.prototype.toDto = function () {
		var dtoObj = {
			Id : this.id
		};

		this.propSpecList.forEach(function (prop) {
			dtoObj[prop.serverId] = ko.unwrap(this[prop.clientId]);
		}, this);

		return dtoObj;
	};

	/** Add a job type */
	exports.prototype.postJobType = function (tmpName) {
		appDatacontext.postCompanyJobType(this.id, {
			name : tmpName,
			description : '',
			companyId : this.id
		}).done(this.pushJobType.bind(this));
	};

	exports.prototype.pushJobType = function (dataOfJobType) {
		this.jobTypeList.push(new JobType(dataOfJobType));
	};

	/**
	 * Load wegions of this company
	 */
	exports.prototype.loadWegions = function () {
		if (!ko.unwrap(this.isLoadedWegions)) {
			wegionService.getInclusive(this.id).done(this.successLoadWegions.bind(this));
		}
	};

	exports.prototype.successLoadWegions = function (dataOfWegions) {
		this.wegions(importWegions(dataOfWegions, this));
		this.isLoadedWegions(true);
	};

	/** Delete well region */
	exports.prototype.removeChild = function (wellRegionForDelete) {
		var ths = this;
		wegionService.remove(wellRegionForDelete.id).done(function () {
			ths.wegions.remove(wellRegionForDelete);
		});
	};

	/**
	 * Find a list of cognate stages
	 *    1. A list for selection box for new widget (name and id)
	 *    2. A list to find specific stage by id: findCognateStage
	 * @returns {Array.<Object>}
	 */
	exports.prototype.getListOfStageByKey = function (keyOfStage) {
		switch (keyOfStage) {
		case stageCnst.company.id:
			return [this];
		case stageCnst.wegion.id:
			return ko.unwrap(this.wegions);
		case stageCnst.wield.id:
			return this.calcListOfWield();
		case stageCnst.wroup.id:
			return this.calcListOfWroup();
		case stageCnst.well.id:
			return this.calcListOfWell();
		}
	};

	/** Find all well fields */
	exports.prototype.calcListOfWield = function () {
		var needArr = [];

		ko.unwrap(this.wegions).forEach(function (wegionItem) {
			ko.unwrap(wegionItem.wields).forEach(function (wieldItem) {
				needArr.push(wieldItem);
			});
		});

		return needArr;
	};

	/** Find all well groups */
	exports.prototype.calcListOfWroup = function () {
		var needArr = [];

		ko.unwrap(this.wegions).forEach(function (wegionItem) {
			ko.unwrap(wegionItem.wields).forEach(function (wieldItem) {
				ko.unwrap(wieldItem.wroups).forEach(function (wroupItem) {
					needArr.push(wroupItem);
				});
			});
		});

		return needArr;
	};

	/** Find all wells */
	exports.prototype.calcListOfWell = function () {
		var needArr = [];

		ko.unwrap(this.wegions).forEach(function (wegionItem) {
			ko.unwrap(wegionItem.wields).forEach(function (wieldItem) {
				ko.unwrap(wieldItem.wroups).forEach(function (wroupItem) {
					ko.unwrap(wroupItem.wells).forEach(function (wellItem) {
						needArr.push(wellItem);
					});
				});
			});
		});

		return needArr;
	};

	/** Save properties */
	exports.prototype.save = function () {
		companyService.put(this.id, this.toDto()).done(this.successSave.bind(this));
	};

	/** Success callback for saving this company */
	exports.prototype.successSave = function (dataOfCompany) {
		// Calculated properties on the server
		var tmpFileSpecOfLogoProp = this.propSpecList.filter(function (elem) {
				return elem.clientId === 'fileSpecOfLogo';
			})[0];

		if (!tmpFileSpecOfLogoProp) {
			throw new ReferenceError('No fileSpecOfLogo property for company model');
		}

		// Value of logo file from server
		var tmpValueOfFileSpecOfLogo = dataOfCompany[tmpFileSpecOfLogoProp.serverId];

		if (tmpValueOfFileSpecOfLogo) {
			this[tmpFileSpecOfLogoProp.clientId](new FileSpec(tmpValueOfFileSpecOfLogo));
		} else {
			this[tmpFileSpecOfLogoProp.clientId](null);
		}
	};

	/** Create and post new well region */
	exports.prototype.postWegion = function (tmpName, scsCallback) {
		wegionService.post({
			'Name' : tmpName,
			'Description' : '',
			'CompanyId' : this.id
		}).done(scsCallback);
	};

	/**
	 * Push a well region to the main list
	 */
	exports.prototype.pushWegion = function (dataOfWegion) {
		this.wegions.push(new Wegion(dataOfWegion, this));
	};

	/**
	 * Load a list of job types
	 */
	exports.prototype.loadJobTypeList = function () {
		appDatacontext.getJobTypeList(this.id).done(this.importJobTypeList.bind(this));
	};

	/** Import job types for this company (joined with global types) */
	exports.prototype.importJobTypeList = function (data) {
		data = data || [];
		this.jobTypeList(data.map(function (item) {
				return new JobType(item);
			}));
	};

	/**
	 * Get guid of this company
	 * @returns {string}
	 */
	exports.prototype.getIdOfCompany = function () {
		return this.id;
	};

	return exports;
});
