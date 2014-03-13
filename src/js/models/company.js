/**
 * @module
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
    stageConstants, 
    appHelper) {
	'use strict';

	/** Import well regions for company */
	function importWegions(data, companyParent) {
		return (data || []).map(function (item) {
			return new Wegion(item, companyParent);
		});
	}

	/** Import job types for this company (joined with global types) */
	function importJobTypeList(data) {
		return (data || []).map(function (item) {
			return new JobType(item);
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

		var ths = this;

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
		this.stageKey = stageConstants.company.id;

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

		this.jobTypeList = ko.lazyObservableArray(function () {
				appDatacontext.getJobTypeList(ths.id).done(function (r) {
					ths.jobTypeList(importJobTypeList(r));
				});
			}, this);

		/** Adding job type */
		this.postJobType = function (tmpName) {
			appDatacontext.postCompanyJobType(ths.id, {
				name : tmpName,
				description : '',
				companyId : ths.id
			}).done(function (jobTypeCreated) {
				ths.jobTypeList.push(new JobType(jobTypeCreated));
			});
		};

		/**
		 * Select region by id: wrap for select wegion function
		 * @param {number} wegionId - Id of well region
		 */
		this.getWegionById = function (wegionId) {
			var needWegion;
			var tmpWegions = ko.unwrap(ths.wegions);

			tmpWegions.forEach(function (tmpWegion) {
				if (tmpWegion.id === wegionId) {
					needWegion = tmpWegion;
				}
			});
			return needWegion;
		};

		/** Delete well region */
		this.removeChild = function (wellRegionForDelete) {
			wegionService.remove(wellRegionForDelete.id).done(function () {
				ths.wegions.remove(wellRegionForDelete);
			});
		};

		/** Create and post new well region */
		this.postWegion = function () {
			var inputName = document.createElement('input');
			inputName.type = 'text';
			$(inputName).prop({
				'required' : true
			}).addClass('form-control');

			var innerDiv = document.createElement('div');
			$(innerDiv).addClass('form-horizontal').append(
				modalHelper.gnrtDom('Name', inputName));

			modalHelper.openModalWindow('Well region', innerDiv, function () {
				wegionService.post({
					'Name' : $(inputName).val(),
					'Description' : '',
					'CompanyId' : ths.id
				}).done(function (result) {
					ths.wegions.push(new Wegion(result, ths));
				});

				modalHelper.closeModalWindow();
			});
		};

		/** Save properties */
		this.save = function () {
			companyService.put(ths.id, ths.toDto()).done(function (r) {
				// Calculated properties on the server
				var tmpFileSpecOfLogoProp = ths.propSpecList.filter(function (elem) {
						return elem.clientId === 'fileSpecOfLogo';
					})[0];

				if (!tmpFileSpecOfLogoProp) {
					throw new ReferenceError('No fileSpecOfLogo property for company model');
				}

				// Value of logo file from server
				var tmpValueOfFileSpecOfLogo = r[tmpFileSpecOfLogoProp.serverId];

				if (tmpValueOfFileSpecOfLogo) {
					ths[tmpFileSpecOfLogoProp.clientId](new FileSpec(tmpValueOfFileSpecOfLogo));
				} else {
					ths[tmpFileSpecOfLogoProp.clientId](null);
				}
			});
		};

		/**
		 * Load wegions of this company
		 */
		this.loadWegions = function () {
			////var tmpInitialUrlData = ko.unwrap(ths.getRootMdl().initialUrlData);

			////function selectWegionIfNeed() {
			////    if (tmpInitialUrlData.wegionId) {
			////        var wegionToSelect = ths.getWegionById(tmpInitialUrlData.wegionId);
			////        if (wegionToSelect) {
			////            ths.selectWegion(wegionToSelect);
			////        }

			////        // Remove to not load again
			////        delete tmpInitialUrlData.wegionId;
			////        ths.getRootMdl().initialUrlData(tmpInitialUrlData);
			////    }
			////}

			if (ko.unwrap(ths.isLoadedWegions)) {
				return;
			}

			wegionService.getInclusive(ths.id).done(function (response) {
				ths.wegions(importWegions(response, ths));
				ths.isLoadedWegions(true);
			});
		};

		/** Convert to data transfer object to sent to the server*/
		this.toDto = function () {
			var dtoObj = {
				Id : ths.id
			};

			ths.propSpecList.forEach(function (prop) {
				dtoObj[prop.serverId] = ko.unwrap(ths[prop.clientId]);
			});

			return dtoObj;
		};

		/** Load sections */
		this.listOfSection(importListOfSectionOfCompanyDto(data.ListOfSectionOfCompanyDto, ths));

		/** Load inner object after initialization: only one time per user profile selection */
		this.loadWegions();
	};

  /** Inherit from a stage base model */
	appHelper.inherits(exports, StageBase);
  
	return exports;
});
