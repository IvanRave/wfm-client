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
		wegionService, wieldService, stageCnst,
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
		this.wields = ko.observableArray([]);
		/** Props specifications */
		this.propSpecList = wegionPropSpecList;

		/**
		 * Stage key: equals file name
		 * @type {string}
		 */
		this.stageKey = stageCnst.wegion.id;

		/** Base for all stages */
		StageBase.call(this, data);

		/** load well fields */
		this.wields(importWieldDtoList(data.WellFieldsDto, this));

		/** Load sections */
		this.listOfSection(importListOfSectionOfWegionDto(data.ListOfSectionOfWegionDto, this));
	};

	/** Inherit from a stage base model */
	appHelper.inherits(exports, StageBase);

	/** Remove a child from a server */
	exports.prototype.removeChild = function (wieldForDelete) {
		wieldService.remove(wieldForDelete.id).done(this.removeFromListOfWield.bind(this, wieldForDelete));
	};

	/** Remove a child from a list */
	exports.prototype.removeFromListOfWield = function (wieldForDelete) {
		this.wields.remove(wieldForDelete);
	};

	// exports.prototype.findCognateStage = function(typeOfStage, idOfStage){

	// };

	/**
	 * Convert model to plain json object without unnecessary properties.
	 *    Can be used to send requests (with clean object) to the server.
	 *    http://knockoutjs.com/documentation/json-data.html
	 *    "ko.toJS — this clones your view model’s object graph, substituting for each observable the current value of that observable,
	 *    so you get a plain copy that contains only your data and no Knockout-related artifacts"
	 */
	exports.prototype.toDto = function () {
		var dtoObj = {
			'Id' : this.id,
			'CompanyId' : this.companyId
		};

		this.propSpecList.forEach(function (prop) {
			dtoObj[prop.serverId] = ko.unwrap(this[prop.clientId]);
		}, this);

		return dtoObj;
	};

	/** Post well field */
	exports.prototype.postWield = function (tmpName) {
		wieldService.post({
			'Name' : tmpName,
			'Description' : '',
			'WellRegionId' : this.id
		}).done(this.pushWield.bind(this));
	};

	exports.prototype.pushWield = function (wieldData) {
		this.wields.push(new WellField(wieldData, this));
	};

	/** Save well region */
	exports.prototype.save = function () {
		wegionService.put(this.id, this.toDto());
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
			return [this.getCompany()];
		case stageCnst.wegion.id:
			return [this];
		case stageCnst.wield.id:
			return ko.unwrap(this.wields);
		case stageCnst.wroup.id:
			return this.calcListOfWroup();
		case stageCnst.well.id:
			return this.calcListOfWell();
		}
	};

	/**
	 * Calc a list of well groups for this region
	 */
	exports.prototype.calcListOfWroup = function () {
		var needArr = [];
		ko.unwrap(this.wields).forEach(function (wieldItem) {
			ko.unwrap(wieldItem.wroups).forEach(function (wroupItem) {
				needArr.push(wroupItem);
			});
		});

		return needArr;
	};

	/**
	 * Calc a list of well groups for this region
	 */
	exports.prototype.calcListOfWell = function () {
		var needArr = [];
		ko.unwrap(this.wields).forEach(function (wieldItem) {
			ko.unwrap(wieldItem.wroups).forEach(function (wroupItem) {
				ko.unwrap(wroupItem.wells).forEach(function (wellItem) {
					needArr.push(wellItem);
				});
			});
		});

		return needArr;
	};

	/**
	 * Get guid of a parent company
	 * @returns {string}
	 */
	exports.prototype.getIdOfCompany = function () {
		return this.getCompany().id;
	};

	return exports;
});
