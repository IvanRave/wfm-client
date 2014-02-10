/** @module */
define(['jquery',
		'knockout',
		'services/datacontext',
		'helpers/modal-helper',
		'models/well',
		'models/wfm-parameter-of-wroup',
		'services/wfm-parameter-of-wroup',
		'models/section-of-stage',
		'models/bases/stage-base',
		'models/prop-spec',
		'services/wroup',
		'constants/stage-constants'],
	function ($,
		ko,
		datacontext,
		bootstrapModal,
		Well,
		WellGroupWfmParameter,
		wfmParameterOfWroupService,
		SectionOfWroup,
		StageBase,
		PropSpec,
		wroupService,
		stageConstants) {
	'use strict';

	// 18. WellGroupWfmParameter
	function importWellGroupWfmParameterDtoList(data, wellGroupItem) {
		return (data || []).map(function (item) {
			return new WellGroupWfmParameter(item, wellGroupItem);
		});
	}

	// 4. Wells (convert data objects into array)
	function importWells(data, parent) {
		return data.map(function (item) {
			return new Well(item, parent);
		});
	}

	/** Import sections */
	function importListOfSectionOfWroupDto(data, parent) {
		return data.map(function (item) {
			return new SectionOfWroup(item, parent);
		});
	}

	/** Main properties for groups */
	var wroupPropSpecList = [
		new PropSpec('Name', 'Name', 'Group name', 'SingleLine', {
			maxLength : 255
		}),
		new PropSpec('Description', 'Description', 'Description', 'MultiLine', {})
	];

	/**
	 * Well group
	 * @constructor
	 * @param {object} data - Group data
	 * @param {module:models/wield} wellField - Well field (parent)
	 */
	var exports = function (data, wellField) {
		data = data || {};

		/** Alternative of this context: for closures etc. */
		var ths = this;

		/**
		 * Get well field (parent)
		 * @returns {module:models/wield}
		 */
		this.getWellField = function () {
			return wellField;
		};

		/** Get root view model */
		this.getRootMdl = function () {
			return this.getWellField().getRootMdl();
		};

		/**
		 * Group id
		 * @type {number}
		 */
		this.Id = data.Id;

		/** Alternatie for caps Id */
		this.id = data.Id;

		/**
		 * Field (parent) id
		 * @type {number}
		 */
		this.WellFieldId = data.WellFieldId;

		/** Property specifications */
		this.propSpecList = wroupPropSpecList;

		/**
		 * Stage key: equals file name
		 * @type {string}
		 */
		this.stageKey = stageConstants.wroup.id;

		/** Base for all stages */
		StageBase.call(this, data);

		/**
		 * List of well for this group
		 * @type {Array.<module:models/well>}
		 */
		this.wells = ko.observableArray();

		/**
		 * Get well by id
		 * @param {number} idOfWell - Id of well
		 */
		this.getWellById = function (idOfWell) {
			return ko.unwrap(ths.wells).filter(function (elem) {
				return elem.id === idOfWell;
			})[0];
		};

		/**
		 * List of wfm parameters for this group
		 * @type {Array.<module:models/wfm-parameter-of-wroup>}
		 */
		this.listOfWfmParameterOfWroup = ko.observableArray();

		/**
		 * Whether parameters are loaded
		 * @type {boolean}
		 */
		this.isLoadedListOfWfmParameterOfWroup = ko.observable(false);

		this.loadListOfWfmParameterOfWroup = function () {
			if (ko.unwrap(ths.isLoadedListOfWfmParameterOfWroup)) {
				return;
			}

			wfmParameterOfWroupService.get(ths.id).done(function (response) {
				ths.listOfWfmParameterOfWroup(importWellGroupWfmParameterDtoList(response));
				ths.isLoadedListOfWfmParameterOfWroup(true);
			});
		};

		/**
		 * Remove param from well group
		 * @param {module:models/wfm-parameter-of-wroup} - Model of the parameter to remove
		 */
		this.removeWfmParameterOfWroup = function (mdlToRemove) {
			wfmParameterOfWroupService.remove(mdlToRemove.wellGroupId, mdlToRemove.wfmParameterId).done(function () {
				ths.listOfWfmParameterOfWroup.remove(mdlToRemove);
			});
		};

		/**
		 * Add selected param to the server with default color and order number
		 */
		this.postWfmParameterOfWroup = function (tmpWfmParamId) {
			wfmParameterOfWroupService.post(ths.id, {
				Color : '',
				SerialNumber : 1,
				WellGroupId : ths.id,
				WfmParameterId : tmpWfmParamId
			}).done(function (response) {
				ths.listOfWfmParameterOfWroup.push(new WellGroupWfmParameter(response, ths));
			});
		};

		this.addWell = function () {
			var inputName = document.createElement('input');
			inputName.type = 'text';
			$(inputName).prop({
				'required' : true
			}).addClass('form-control');

			var innerDiv = document.createElement('div');
			$(innerDiv).addClass('form-horizontal').append(
				bootstrapModal.gnrtDom('Name', inputName));

			function submitFunction() {
				datacontext.postWell({
					Name : $(inputName).val(),
					Description : '',
					WellGroupId : ths.Id
				}).done(function (result) {
					ths.wells.push(new Well(result, ths));
				});

				bootstrapModal.closeModalWindow();
			}

			bootstrapModal.openModalWindow('Well', innerDiv, submitFunction);
		};

		this.removeChild = function (wellForDelete) {
			datacontext.deleteWell(wellForDelete).done(function () {
				ths.wells.remove(wellForDelete);
			});
		};

		this.save = function () {
			wroupService.put(ths.Id, ths.toDto());
		};

		/** Set this section as selected */
		this.loadSectionContent = function (idOfSectionPattern) {
			switch (idOfSectionPattern) {
			case 'wroup-unit':
      case 'wroup-potential':
				// Get all maps from this field
				ths.loadListOfWfmParameterOfWroup();
				break;
			}
		};

		this.toDto = function () {
			var dtoObj = {
				'Id' : ths.Id,
				'WellFieldId' : ths.WellFieldId
			};

			ths.propSpecList.forEach(function (prop) {
				dtoObj[prop.serverId] = ko.unwrap(ths[prop.clientId]);
			});

			return dtoObj;
		};

		// load wells
		this.wells(importWells(data.WellsDto, ths));

		/** Load sections */
		this.listOfSection(importListOfSectionOfWroupDto(data.ListOfSectionOfWroupDto, ths));
	};

	return exports;
});
