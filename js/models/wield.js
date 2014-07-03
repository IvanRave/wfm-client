/** @module */
define(['knockout',
		'services/datacontext',
		'helpers/file-helper',
		'base-models/stage-base',
		'models/map-of-wield',
		'services/map-of-wield',
		'models/section-of-stage',
		'models/wroup',
		'models/prop-spec',
		'services/wield',
		'services/wroup',
		'constants/stage-constants',
		'helpers/app-helper'],
	function (ko, datacontext,
		fileHelper, StageBase, MapOfWield, mapOfWieldService, SectionOfWield, WellGroup,
		PropSpec, wieldService, wroupService, stageCnst, appHelper) {
	'use strict';

	// 10. WellFieldMaps (convert data objects into array)
	function importWellFieldMapsDto(data, parent) {
		return (data || []).map(function (item) {
			return new MapOfWield(item, parent);
		});
	}

	// 3. WellGroup (convert data objects into array)
	function importWroupDtoList(data, parent) {
		return (data || []).map(function (item) {
			return new WellGroup(item, parent);
		});
	}

	function importListOfSectionOfWieldDto(data, parent) {
		return (data || []).map(function (item) {
			return new SectionOfWield(item, parent);
		});
	}

	/** Main properties for company: headers can be translated here if needed */
	var wieldPropSpecList = [
		new PropSpec('name', 'Name', 'Field name', 'SingleLine', {
			maxLength : 255
		}),
		new PropSpec('description', 'Description', 'Description', 'MultiLine', {})
	];

	/**
	 * Well field
	 * @constructor
	 * @param {object} data - Field data
	 * @param {module:models/wegion} wellRegion - Region (parent)
	 */
	var exports = function (data, wellRegion) {
		data = data || {};

		var ths = this;

		/** Get region (parent) */
		this.getWellRegion = function () {
			return wellRegion;
		};

		/** Get root view model */
		this.getRootMdl = function () {
			return this.getWellRegion().getRootMdl();
		};

		this.propSpecList = wieldPropSpecList;

		// TODO: change to small id
		/**
		 * Field id
		 * @type {number}
		 */
		this.Id = data.Id;

		/** Alternative for Id */
		this.id = data.Id;

		/**
		 * Id of region (parent): foreign key
		 * @type {number}
		 */
		this.idOfWegion = data.WellRegionId;

		/**
		 * Stage key: equals file name
		 * @type {string}
		 */
		this.stageKey = stageCnst.wield.id;

		// Add identical properties for all stages (well, field, group, regions, company)
		StageBase.call(this, data);

		/**
		 * List of groups
		 * @type {Array.<module:models/wroup>}
		 */
		this.wroups = ko.observableArray();

		/**
		 * List of maps
		 * @type {Array.<module:models/map-of-wield>}
		 */
		this.WellFieldMaps = ko.observableArray();

		/**
		 * Whether maps are loaded
		 * @type {boolean}
		 */
		this.isLoadedMapsOfWield = ko.observable(false);

		/** Save non-reference properties, like groups, or region */
		this.save = function () {
			wieldService.put(ths.Id, ths.toDto());
		};

		/** Convert to data transfer object: only simple props */
		this.toDto = function () {
			var dtoObj = {
				'Id' : ths.Id,
				'WellRegionId' : ths.idOfWegion
			};

			ths.propSpecList.forEach(function (prop) {
				dtoObj[prop.serverId] = ko.unwrap(ths[prop.clientId]);
			});

			return dtoObj;
		};

		/** Load groups */
		this.wroups(importWroupDtoList(data.WellGroupsDto, this));

		/** Load sections */
		this.listOfSection(importListOfSectionOfWieldDto(data.ListOfSectionOfWieldDto, this));
	};

	/** Inherit from a stage base model */
	appHelper.inherits(exports, StageBase);

	/** Load all maps for this field */
	exports.prototype.loadMapsOfWield = function () {
		if (ko.unwrap(this.isLoadedMapsOfWield)) {
			return;
		}
		var ths = this;
		mapOfWieldService.get(this.id).done(function (result) {
			ths.isLoadedMapsOfWield(true);
			ths.WellFieldMaps(importWellFieldMapsDto(result, ths));
			console.log('maps are loaded', result, ko.unwrap(ths.WellFieldMaps));
		});
	};

	/** Send a map to the server */
	exports.prototype.postMapOfWield = function (tmpIdOfFileSpec, tmpNameOfFileSpec, scsCallback) {
		var ths = this;
		// Create map on the server with this file
		mapOfWieldService.post(ths.id, {
			WellFieldId : ths.id,
			ScaleCoefficient : 1,
			Description : '',
			// by default - map name = file name
			Name : tmpNameOfFileSpec,
			IdOfFileSpec : tmpIdOfFileSpec
		}).done(function (r) {
			ths.WellFieldMaps.push(new MapOfWield(r, ths));

			scsCallback();
		});
	};

	/**
	 * Get well group by id
	 * @param {number} idOfWroup - Id of well group
	 */
	exports.prototype.getWroupById = function (idOfWroup) {
		var tmpWroups = ko.unwrap(this.wroups);
		return tmpWroups.filter(function (elem) {
			return elem.id === idOfWroup;
		})[0];
	};

	/** Post well group */
	exports.prototype.postWroup = function (tmpName) {
		var ths = this;
		wroupService.post({
			'Name' : tmpName,
			'Description' : '',
			'WellFieldId' : ths.id
		}).done(function (result) {
			ths.wroups.push(new WellGroup(result, ths));
		});
	};

	/** Remove a child */
	exports.prototype.removeChild = function (wellGroupForDelete) {
		var ths = this;
		wroupService.remove(wellGroupForDelete.id).done(function () {
			ths.wroups.remove(wellGroupForDelete);
		});
	};

	/** Remove a map from the field */
	exports.prototype.removeMapOfWield = function (itemToDelete) {
		var ths = this;
		mapOfWieldService.remove(ths.id, itemToDelete.id).done(function () {
			ths.WellFieldMaps.remove(itemToDelete);
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
			return [this.getWellRegion().getCompany()];
		case stageCnst.wegion.id:
			return [this.getWellRegion()];
		case stageCnst.wield.id:
			return [this];
		case stageCnst.wroup.id:
			return ko.unwrap(this.wroups);
		case stageCnst.well.id:
			return this.calcListOfWell();
		}
	};

	/** Calc all wells for this well field */
	exports.prototype.calcListOfWell = function () {
		var needArr = [];

		ko.unwrap(this.wroups).forEach(function (wroupItem) {
			ko.unwrap(wroupItem.wells).forEach(function (wellItem) {
				needArr.push(wellItem);
			});
		});

		return needArr;
	};

	/**
	 * Get guid of a parent company
	 * @returns {string}
	 */
	exports.prototype.getIdOfCompany = function () {
		return this.getWellRegion().getCompany().id;
	};

	return exports;
});
