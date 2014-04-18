/** @module */
define(['jquery',
		'knockout',
		'services/datacontext',
		'models/well',
		'models/wfm-parameter-of-wroup',
		'services/wfm-parameter-of-wroup',
		'models/section-of-stage',
		'base-models/stage-base',
		'models/prop-spec',
		'services/wroup',
		'constants/stage-constants',
		'services/procent-border',
		'services/monitoring-record',
		'helpers/app-helper'],
	function ($,
		ko,
		datacontext,
		Well,
		WellGroupWfmParameter,
		wfmParameterOfWroupService,
		SectionOfWroup,
		StageBase,
		PropSpec,
		wroupService,
		stageCnst,
		procentBorderService,
		monitoringRecordService,
		appHelper) {
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
		this.stageKey = stageCnst.wroup.id;

		/** Base for all stages */
		StageBase.call(this, data);

		/**
		 * List of well for this group
		 * @type {Array.<module:models/well>}
		 */
		this.wells = ko.observableArray();

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

		/**
		 * Sum of totals of test scopes
		 *    for wroup potential
		 */
		this.totalTestScopeOfWells = ko.computed({
				read : function () {
					var result = {};
					var tmpActiveWells = ko.unwrap(ths.wells).filter(function (elem) {
							return ko.unwrap(elem['IsActive']) === true;
						});

					var tmpWroupParams = ko.unwrap(ths.listOfWfmParameterOfWroup);

					tmpActiveWells.forEach(function (tmpWell) {
						var tmpLastApprovedTestScope = ko.unwrap(tmpWell.lastApprovedTestScope);
						if (tmpLastApprovedTestScope) {
							var tmpTestDataTotal = ko.unwrap(tmpLastApprovedTestScope.testDataTotal);
							tmpWroupParams.forEach(function (tmpParam) {
								if (!result[tmpParam.wfmParameterId]) {
									result[tmpParam.wfmParameterId] = 0;
								}

								result[tmpParam.wfmParameterId] +=  + (tmpTestDataTotal[tmpParam.wfmParameterId] || 0);
							});
						}
					});

					return result;
				},
				deferEvaluation : true
			});

		//{ #region MONITORING

		/**
		 * List of monitored params
		 * @type {Array.<module:models/wfm-parameter-of-well-group>}
		 */
		this.listOfMonitoredParams = ko.computed({
				read : function () {
					var tmpList = ko.unwrap(ths.listOfWfmParameterOfWroup);
					return tmpList.filter(function (elem) {
						return ko.unwrap(elem.isMonitored);
					});
				},
				deferEvaluation : true
			});

		/**
		 * Whether procent borders are loaded
		 * @type {boolean}
		 */
		this.isLoadedProcentBordersForAllWells = ko.observable(false);

		//} #endregion MONITORING

		/** Load wells */
		this.wells(importWells(data.WellsDto, ths));

		/** Load sections */
		this.listOfSection(importListOfSectionOfWroupDto(data.ListOfSectionOfWroupDto, ths));
	};

	/** Inherit from a stage base model */
	appHelper.inherits(exports, StageBase);

	/**
	 * Load procent borders for all wells
	 */
	exports.prototype.loadProcentBordersForAllWells = function () {
		var ths = this;
		if (ko.unwrap(ths.isLoadedProcentBordersForAllWells)) {
			return;
		}

		procentBorderService.getForAllWells(ths.id).done(function (tmpScope) {
			ths.isLoadedProcentBordersForAllWells(true);
			console.log(tmpScope);
			var tmpWells = ko.unwrap(ths.wells);

			// Import data to each well
			tmpWells.forEach(function (tmpWell) {
				// Get array of procent borders for need well
				var tmpProcentBordersForWell = tmpScope.filter(function (scopeItem) {
						return scopeItem.IdOfWell === tmpWell.id;
					})[0].ArrayOfProcentBorder;

				tmpWell.importProcentBorders(tmpProcentBordersForWell);
			});
		});
	};

	/**
	 * Convert to DTO
	 */
	exports.prototype.toDto = function () {
		var ths = this;

		var dtoObj = {
			'Id' : ths.Id,
			'WellFieldId' : ths.WellFieldId
		};

		ths.propSpecList.forEach(function (prop) {
			dtoObj[prop.serverId] = ko.unwrap(ths[prop.clientId]);
		});

		return dtoObj;
	};

	/**
	 * Load data for all wells and for need date
	 * @param {number} tmpUnixTime - Need date
	 * @param {object} tmpMntrParams - Monitored parameters
	 */
	exports.prototype.loadListOfScopeOfMonitoring = function (tmpUnixTime, tmpMntrParams) {
		var ths = this;
		// TODO: if there are data for this date - no need to load #LH!
		monitoringRecordService.getListOfScope(ths.id, tmpUnixTime).done(function (tmpListOfScope) {
			var tmpWells = ko.unwrap(ths.wells);

			// Import data to each well
			tmpWells.forEach(function (tmpWell) {
				// Get array of data for need well
				var needScope = tmpListOfScope.filter(function (scopeItem) {
						return scopeItem.IdOfWell === tmpWell.id;
					})[0];

				if (needScope) {
					// Import data to the well
					tmpWell.importMonitoringRecords(needScope.ListOfMonitoringRecord, tmpMntrParams);
				}
			});
		});
	};

	/**
	 * Save this well group
	 */
	exports.prototype.save = function () {
		wroupService.put(this.id, this.toDto());
	};

	/**
	 * Remove a child well
	 * @param {module:models/well} wellToRemove - Well to remove
	 */
	exports.prototype.removeChild = function (wellToRemove) {
		var ths = this;

		datacontext.deleteWell(wellToRemove).done(function () {
			ths.wells.remove(wellToRemove);
		});
	};

	/**
	 * Create a new well
	 * @param {string} tmpName - Well name
	 */
	exports.prototype.postWell = function (tmpName, scsCallback) {
		var ths = this;
		datacontext.postWell({
			Name : tmpName,
			Description : '',
			WellGroupId : ths.id,
			IsActive : true
		}).done(function (result) {
			ths.wells.push(new Well(result, ths));
			scsCallback();
		});
	};

	/**
	 * Load parameters
	 */
	exports.prototype.loadListOfWfmParameterOfWroup = function (callback) {
		if (!ko.unwrap(this.isLoadedListOfWfmParameterOfWroup)) {
			wfmParameterOfWroupService.get(this.id).done(this.scsLoadListOfWfmParameterOfWroup.bind(this, callback));
		} else {
			if (appHelper.isFunction(callback)) {
				callback();
			}
		}
	};

	/**
	 * Success callback
	 * @private
	 */
	exports.prototype.scsLoadListOfWfmParameterOfWroup = function (callback, response) {
		this.listOfWfmParameterOfWroup(importWellGroupWfmParameterDtoList(response));
		this.isLoadedListOfWfmParameterOfWroup(true);
		if (appHelper.isFunction(callback)) {
			callback();
		}
	};

	/**
	 * Remove param from a well group
	 * @param {module:models/wfm-parameter-of-wroup} - Model of the parameter to remove
	 */
	exports.prototype.removeWfmParameterOfWroup = function (mdlToRemove) {
		var ths = this;
		wfmParameterOfWroupService.remove(mdlToRemove.wellGroupId, mdlToRemove.wfmParameterId).done(function () {
			ths.listOfWfmParameterOfWroup.remove(mdlToRemove);
		});
	};

	/**
	 * Add selected param to the server with default color and order number
	 * @param {string} tmpWfmParamId - Id of a parameter, like well-map
	 */
	exports.prototype.postWfmParameterOfWroup = function (tmpWfmParamId, tmpColor, tmpUom) {
		wfmParameterOfWroupService.post(this.id, {
			Color : tmpColor,
			SerialNumber : 1,
			WellGroupId : this.id,
			WfmParameterId : tmpWfmParamId,
			IsMonitored : false,
      Uom: tmpUom
		}).done(this.pushWfmParameterOfWroup.bind(this));
	};

	exports.prototype.pushWfmParameterOfWroup = function (data) {
		this.listOfWfmParameterOfWroup.push(new WellGroupWfmParameter(data, this));
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
			return [this.getWellField().getWellRegion().getCompany()];
		case stageCnst.wegion.id:
			return [this.getWellField().getWellRegion()];
		case stageCnst.wield.id:
			return [this.getWellField()];
		case stageCnst.wroup.id:
			return [this];
		case stageCnst.well.id:
			return ko.unwrap(this.wells);
		}
	};

	/**
	 * Get guid of a parent company
	 * @returns {string}
	 */
	exports.prototype.getIdOfCompany = function () {
		return this.getWellField().getWellRegion().getCompany().id;
	};

	return exports;
});
