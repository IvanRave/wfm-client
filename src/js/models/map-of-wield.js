/** @module */
define(['jquery', 'knockout', 'services/datacontext', 'helpers/modal-helper',
		'helpers/app-helper', 'models/file-spec', 'services/map-of-wield', 'viewmodels/map-of-wield',
		'models/area-of-map-of-wield', 'models/well-marker-of-map-of-wield', 'services/well-marker-of-map-of-wield'],
	function ($, ko, datacontext, bootstrapModal, appHelper, FileSpec, mapOfWieldService, MapOfWieldVwm,
		AreaOfMapOfWield, WellOfMapOfWield, wellMarkerService) {
	'use strict';

	function importAreas(data, parent) {
		return (data || []).map(function (item) {
			return datacontext.createWellFieldMapArea(item, parent);
		});
	}

	function importWellMarkers(data, parent) {
		return (data || []).map(function (item) {
			return new WellOfMapOfWield(item, parent);
		});
	}

	/**
	 * Well field map model
	 * @param {object} data - Map data
	 * @param {WellField} wellField - Well field
	 * @constructor
	 */
	var exports = function (data, wellField) {
		data = data || {};

		/** Gettter for well field (parent) */
		this.getWellField = function () {
			return wellField;
		};

		/**
		 * Map id: alternative property name
		 * @type {number}
		 */
		this.id = data.Id;

		/**
		 * Map name (by default - file name)
		 * @type {string}
		 */
		this.name = ko.observable(data.Name);

		/**
		 * Id of file specification (guid)
		 * @type {string}
		 */
		this.idOfFileSpec = data.IdOfFileSpec;

		/**
		 * Map file specification
		 * @type {module:models/file-spec}
		 */
		this.fileSpec = new FileSpec(data.FileSpecDto);

		/**
		 * Map description
		 * @type {string}
		 */
		this.description = ko.observable(data.Description);

		/**
		 * Pixels in one unit of measurement (m, cm, foot etc)
		 * @type {number}
		 */
		this.scaleCoefficient = ko.observable(data.ScaleCoefficient);

		/**
		 * Well field (parent) id
		 * @type {number}
		 */
		this.idOfWield = data.WellFieldId;

		/**
		 * Map areas
		 * @type {Array.<WellFieldMapArea>}
		 */
		this.areas = ko.observableArray();

		/**
		 * Well markers on this map
		 * @type {Array.<Well>}
		 */
		this.wellMarkers = ko.observableArray();

		/**
		 * Field wells, not in this map
		 * @type {Array.<module:models/well>}
		 */
		this.outWellsOfWield = ko.computed({
				read : this.getOutWellsOfWield,
				deferEvaluation : true,
        owner: this
			});

		// Load data (async) after all props

		/** Load markers */
		this.wellMarkers(importWellMarkers(data.ListOfDtoOfWellMarker, this));

		/** Load areas */
		this.areas(importAreas(data.WellFieldMapAreasDto, this));
	};

	/**
	 * Post well marker
	 */
	exports.prototype.postWellMarker = function (idOfWell, coords) {
		var ths = this;

		wellMarkerService.post(ths.id, {
			IdOfWell : idOfWell,
			IdOfMapOfWield : ths.id,
			CoordX : coords[0],
			CoordY : coords[1]
		}).done(function (r) {
			ths.wellMarkers.push(new WellOfMapOfWield(r, ths));
		});
	};

	/** Remove well marker from this map */
	exports.prototype.removeWellMarker = function (wellMarkerToRemove) {
		var ths = this;

		wellMarkerService.remove(ths.id, wellMarkerToRemove.idOfWell).done(function () {
			ths.wellMarkers.remove(wellMarkerToRemove);
		});
	};

	/** Convert to plain json */
	exports.prototype.toPlainJson = function () {
		return ko.toJS(this);
	};

	/** TODO: Change #33! */
	exports.prototype.editWellFieldMap = function () {
		var ths = this;
		var inputName = document.createElement('input');
		inputName.type = 'text';
		$(inputName).val(ko.unwrap(ths.name)).prop({
			'required' : true
		});

		var inputDescription = document.createElement('input');
		inputDescription.type = 'text';
		$(inputDescription).val(ko.unwrap(ths.description));

		var inputScaleCoefficient = document.createElement('input');
		inputScaleCoefficient.type = 'text';
		$(inputScaleCoefficient).val(ko.unwrap(ths.scaleCoefficient)).prop({
			'required' : true
		});

		var innerDiv = document.createElement('div');
		$(innerDiv).addClass('form-horizontal').append(
			bootstrapModal.gnrtDom('Name', inputName),
			bootstrapModal.gnrtDom('Description', inputDescription),
			bootstrapModal.gnrtDom('ScaleCoefficient, 1:', inputScaleCoefficient));

		function submitFunction() {
			ths.name($(inputName).val());
			ths.description($(inputDescription).val());
			ths.scaleCoefficient($(inputScaleCoefficient).val());
			mapOfWieldService.put(ths.idOfWield, ths.id, ths.toPlainJson()).done(function (result) {
				ths.name(result.Name);
				ths.description(result.Description);
				ths.scaleCoefficient(result.ScaleCoefficient);
			});
			bootstrapModal.closeModalWindow();
		}

		bootstrapModal.openModalWindow('Well field map', innerDiv, submitFunction);
	};

  /**
  * Get wells, which are not in selected list
  */
	exports.prototype.getOutWellsOfWield = function () {
		var ths = this;
		var wellMarkersOnMap = ko.unwrap(ths.wellMarkers);

		/** IDs of wells, which placed on this map */
		var idsOfWellsOfMap = wellMarkersOnMap.map(function (wellMarkerItem) {
				return wellMarkerItem.idOfWell;
			});

		var wroupsOfWield = ko.unwrap(ths.getWellField().wroups);

		var wellsOfWield = [];

		wroupsOfWield.forEach(function (wroupItem) {
			wellsOfWield = wellsOfWield.concat(ko.unwrap(wroupItem.wells));
		});

		return wellsOfWield.filter(function (wellItem) {
			return ($.inArray(wellItem.id, idsOfWellsOfMap) === -1);
		});
	};

	return exports;
});
