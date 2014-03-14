/** @module */
define(['jquery',
		'knockout',
		'services/datacontext',
		'models/wield',
		'base-models/stage-base',
		'models/section-of-stage',
		'models/prop-spec',
		'services/wegion',
		'services/wield',
		'constants/stage-constants',
		'helpers/app-helper'],
	function ($, ko, datacontext,
		WellField, StageBase, SectionOfWegion,
		PropSpec,
		wegionService, wieldService, stageConstants,
		appHelper) {
	'use strict';

	// 2. WellField (convert data objects into array)
	function importWieldDtoList(data, parent) {
		return data.map(function (item) {
			return new WellField(item, parent);
		});
	}

	function importListOfSectionOfWegionDto(data, parent) {
		return data.map(function (item) {
			return new SectionOfWegion(item, parent);
		});
	}

	/** Main properties for company: headers can be translated here if needed */
	var wegionPropSpecList = [
		new PropSpec('name', 'Name', 'Region name', 'SingleLine', {
			maxLength : 255
		}),
		new PropSpec('description', 'Description', 'Description', 'MultiLine', {})
	];

	/**
	 * Well region
	 * @constructor
	 * @param {object} data - Region data
	 * @param {module:models/company} company - Region company (parent)
	 */
	var exports = function (data, company) {
		data = data || {};

		var ths = this;

		this.getCompany = function () {
			return company;
		};

		/** Get root view model */
		this.getRootMdl = function () {
			return this.getCompany().getRootMdl();
		};

		// Persisted properties
		this.id = data.Id;
		this.companyId = data.CompanyId;
		this.wields = ko.observableArray();
		/** Props specifications */
		this.propSpecList = wegionPropSpecList;

		/**
		 * Stage key: equals file name
		 * @type {string}
		 */
		this.stageKey = stageConstants.wegion.id;

		/** Base for all stages */
		StageBase.call(this, data);

		/**
		 * Get well field by id
		 * @param {number} idOfWield - Well field id
		 */
		this.getWieldById = function (idOfWield) {
			var tmpWields = ko.unwrap(ths.wields);
			return tmpWields.filter(function (elem) {
				return elem.id === idOfWield;
			})[0];
		};

		/** Save well region */
		this.save = function () {
			wegionService.put(ths.id, ths.toDto());
		};

		/** Post well field */
		this.postWield = function (tmpName) {
			wieldService.post({
				'Name' : tmpName,
				'Description' : '',
				'WellRegionId' : ths.id
			}).done(function (result) {
				ths.wields.push(new WellField(result, ths));
			});
		};

		/// <summary>
		/// Convert model to plain json object without unnecessary properties. Can be used to send requests (with clean object) to the server
		/// </summary>
		/// <remarks>
		/// http://knockoutjs.com/documentation/json-data.html
		/// "ko.toJS — this clones your view model’s object graph, substituting for each observable the current value of that observable,
		/// so you get a plain copy that contains only your data and no Knockout-related artifacts"
		/// </remarks>
		this.toDto = function () {
			var dtoObj = {
				'Id' : ths.id,
				'CompanyId' : ths.companyId
			};

			ths.propSpecList.forEach(function (prop) {
				dtoObj[prop.serverId] = ko.unwrap(ths[prop.clientId]);
			});

			return dtoObj;
		};

		/** load well fields */
		this.wields(importWieldDtoList(data.WellFieldsDto, ths));

		/** Load sections */
		this.listOfSection(importListOfSectionOfWegionDto(data.ListOfSectionOfWegionDto, ths));
	};

	/** Inherit from a stage base model */
	appHelper.inherits(exports, StageBase);

  /** Remove a child */
	exports.prototype.removeChild = function (wellFieldForDelete) {
		var ths = this;
		wieldService.remove(wellFieldForDelete.id).done(function () {
			ths.wields.remove(wellFieldForDelete);
		});
	};

	return exports;
});
