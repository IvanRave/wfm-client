/**
 * @module
 * @todo feat: map widget #MM!
 *             using only maps with this well
 */
define([
		'jquery',
		'knockout',
		'helpers/modal-helper',
		'helpers/app-helper',
		'constants/stage-constants',
		'base-viewmodels/stage-base',
		'viewmodels/sketch-of-well',
		'viewmodels/volume-of-well',
		'viewmodels/scope-of-history-of-well',
		'viewmodels/log-of-well',
		'viewmodels/nodal-analysis-of-well',
		'viewmodels/integrity-of-well',
		'viewmodels/perfomance-of-well',
		'viewmodels/test-scope',
		'viewmodels/monitoring-of-well',
		'viewmodels/map-of-wield',
		'viewmodels/well-marker-of-map-of-wield'],
	function (
		$,
		ko,
		bootstrapModal,
		appHelper,
		stageCnst,
		VwmStageBase,
		VwmSketchOfWell,
		VwmVolumeOfWell,
		VwmScopeOfHistoryOfWell,
		VwmLogOfWell,
		VwmNodalAnalysis,
		VwmIntegrity,
		VwmPerfomanceOfWell,
		VwmTestScope,
		VwmMonitoringOfWell,
		VwmMapOfWield,
		VwmWellMarkerOfMapOfWield) {
	'use strict';

	/**
	 * Returns a random number between min and max
	 */
	function getRandomArbitary(min, max) {
		return Math.random() * (max - min) + min;
	}

	/**
	 * Generate dictionary with random numbers
	 */
	function generateDict(tmpMntrParams) {
		var genDict = {};

		tmpMntrParams.forEach(function (tmpPrm) {
			genDict[tmpPrm.wfmParameterId] = getRandomArbitary(10, 1000);
		});

		return genDict;
	}

	/**
	 * Well view model
	 * @constructor
	 * @augments {module:base-viewmodels/stage-base}
	 */
	var exports = function (mdlWell, parentVwmWroup, defaultSlcData) {
		this.mdlStage = mdlWell;

		this.unq = mdlWell.id;

		/**
		 * Get parent viewmodel (wroup)
		 */
		this.getParentVwm = function () {
			return parentVwmWroup;
		};

		// Has sections and widgets
		VwmStageBase.call(this, defaultSlcData.wellSectionId, parentVwmWroup.unqOfSlcVwmChild, null);
    
		//mdlSketchOfWell, koWellUnzOfSlcVwmSectionFmg, koSlcVwmSectionFmg,  fmgrLink
		this.vwmSketchOfWell = new VwmSketchOfWell(this.mdlStage.sketchOfWell, this.unzOfSlcVwmSectionFmg, this.slcVwmSectionFmg, this.fmgrModal);

		//{ #region VOLUME-PROPS

		/**
		 * List of views of volume of well
		 * @type {Array.<viewmodels/volume-of-well>}
		 */
		this.listOfVwmVolumeOfWell = ko.computed({
				read : this.buildListOfVwmVolumeOfWell,
				deferEvaluation : true,
				owner : this
			}).trackHasItems();

		/**
		 * Id of selected view, equals id of file spec (guid)
		 * @type {string}
		 */
		this.vidOfSlcVwmVolumeOfWell = ko.observable();

		/**
		 * Selected view
		 * @type {module:viewmodels/volume-of-well}
		 */
		this.slcVwmVolumeOfWell = ko.computed({
				read : this.calcSlcVwmVolumeOfWell,
				deferEvaluation : true,
				owner : this
			});

		//} #endregion VOLUME-PROPS

		//{ #region HISTORY

		/**
		 * A viewmodel for the main list of history records (order from newer to older)
		 * @type {module:viewmodels/history-of-well}
		 */
		this.vwmScopeOfHistoryOfWell = new VwmScopeOfHistoryOfWell(this,
				ko.observable(null),
				ko.observable(null),
				ko.observable(null),
				ko.observable(-1));

		//} #endregion HISTORY

		//{ #region LOG

    var ths = this;
    
		/**
		 * List of viewmodels of log of well
		 * @type {Array.<module:viewmodels/log-of-well>}
		 */
		this.listOfVwmLogOfWell = ko.computed({
				read : function () {
					return ko.unwrap(ths.mdlStage.logsOfWell).map(function (elem) {
						return new VwmLogOfWell(elem, ths.vidOfSlcVwmLogOfWell);
					});
				},
				deferEvaluation : true,
				owner : this
			});

		/**
		 * View id for log
		 */
		this.vidOfSlcVwmLogOfWell = ko.observable();

		/**
		 * Selected view for log
		 *    By default: first log
		 * @type {module:viewmodels/log-of-well}
		 */
		this.slcVwmLogOfWell = ko.computed({
				read : function () {
					var tmpVid = ko.unwrap(ths.vidOfSlcVwmLogOfWell);
					var tmpList = ko.unwrap(ths.listOfVwmLogOfWell);
					if (tmpVid) {
						return tmpList.filter(function (elem) {
							return elem.vid === tmpVid;
						})[0];
					} else {
						var tmpObj = tmpList[0];
						if (tmpObj) {
							ths.vidOfSlcVwmLogOfWell(tmpObj.vid);
							return tmpObj;
						}
					}
				},
				deferEvaluation : true
			});

		/**
		 * Select viewmodel of log
		 */
		this.selectVwmLogOfWell = function (vwmLogOfWellToSelect) {
			ths.vidOfSlcVwmLogOfWell(vwmLogOfWellToSelect.vid);
		};

		//} #endregion LOG

		//{ #region NODALANALYSIS

		/**
		 * List of viewmodels
		 */
		this.listOfVwmNodalAnalysis = ko.computed({
				read : function () {
					return ko.unwrap(ths.mdlStage.listOfNodalAnalysis).map(function (elem) {
						return new VwmNodalAnalysis(elem, ths.vidOfSlcVwmNodalAnalysis);
					});
				},
				deferEvaluation : true
			});

		/**
		 * Id of selected viewmodel
		 */
		this.vidOfSlcVwmNodalAnalysis = ko.observable();

		/**
		 * Selected viewmodel
		 */
		this.slcVwmNodalAnalysis = ko.computed({
				read : function () {
					var tmpVid = ko.unwrap(ths.vidOfSlcVwmNodalAnalysis);
					var tmpList = ko.unwrap(ths.listOfVwmNodalAnalysis);
					if (tmpVid) {
						return tmpList.filter(function (elem) {
							return elem.vid === tmpVid;
						})[0];
					} else {
						// Get first element by default
						var tmpElem = tmpList[0];
						if (tmpElem) {
							ths.vidOfSlcVwmNodalAnalysis(tmpElem.vid);
							return tmpElem;
						}
					}
				},
				deferEvaluation : true
			});

		/**
		 * Select view model
		 */
		this.selectVwmNodalAnalysis = function (vwmToSelect) {
			ths.vidOfSlcVwmNodalAnalysis(vwmToSelect.vid);
		};

		/**
		 * Remove viewmodel and model
		 */
		this.removeVwmNodalAnalysis = function (vwmToRemove) {
			if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(vwmToRemove.mdlNodalAnalysis.name) + '"?')) {
				ths.mdlStage.removeNodalAnalysis(vwmToRemove.mdlNodalAnalysis);
			}
		};

		//} #endregion NODALANALYSIS

		//{ #region INTEGRITY

		/**
		 * List of viewmodels
		 */
		this.listOfVwmIntegrity = ko.computed({
				read : function () {
					return ko.unwrap(ths.mdlStage.listOfIntegrity).map(function (elem) {
						return new VwmIntegrity(elem, ths.vidOfSlcVwmIntegrity);
					});
				},
				deferEvaluation : true
			});

		/**
		 * Id of selected viewmodel
		 */
		this.vidOfSlcVwmIntegrity = ko.observable();

		/**
		 * Selected viewmodel
		 */
		this.slcVwmIntegrity = ko.computed({
				read : function () {
					var tmpVid = ko.unwrap(ths.vidOfSlcVwmIntegrity);
					var tmpList = ko.unwrap(ths.listOfVwmIntegrity);
					if (tmpVid) {
						return tmpList.filter(function (elem) {
							return elem.vid === tmpVid;
						})[0];
					} else {
						// Get first element by default
						var tmpElem = tmpList[0];
						if (tmpElem) {
							ths.vidOfSlcVwmIntegrity(tmpElem.vid);
							return tmpElem;
						}
					}
				},
				deferEvaluation : true
			});

		/**
		 * Select view model
		 */
		this.selectVwmIntegrity = function (vwmToSelect) {
			ths.vidOfSlcVwmIntegrity(vwmToSelect.vid);
		};

		/**
		 * Remove viewmodel and model
		 */
		this.removeVwmIntegrity = function (vwmToRemove) {
			if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(vwmToRemove.mdlIntegrity.name) + '"?')) {
				ths.mdlStage.removeIntegrity(vwmToRemove.mdlIntegrity);
			}
		};

		//} #endregion INTEGRITY

		//{ #region PERFOMANCE

		/**
		 * Viewmodel for the perfomance section
		 * @type {module:viewmodels/perfomance-of-well}
		 */
		this.mainVwmPerfomanceOfWell = new VwmPerfomanceOfWell(ths.mdlStage.perfomanceOfWell, ths,
				ko.observable(null), ko.observable(null), ko.observable(null), ko.observable(null),
				ko.observable(null), ko.observable(false));

		//} #endregion PERFOMANCE

		//{ #region TEST

		this.listOfVwmTestScope = ko.computed({
				read : function () {
					return ko.unwrap(this.mdlStage.listOfTestScope).map(function (elem) {
						return new VwmTestScope(elem);
					});
				},
				deferEvaluation : true,
        owner: this
			});

		/**
		 * List of tests, sorted by time
		 */
		this.handledListOfVwmTestScope = ko.computed({
				read : function () {
					return ko.unwrap(ths.listOfVwmTestScope).sort(function (left, right) {
						var tmpLeftTime = ko.unwrap(left.mdlTestScope.startUnixTime),
						tmpRightTime = ko.unwrap(right.mdlTestScope.startUnixTime);

						return tmpLeftTime === tmpRightTime ? 0 : (tmpLeftTime < tmpRightTime ? 1 : -1);
					});
				},
				deferEvaluation : true
			});

		//} #endregion TEST

		//{ #region MONITORING (MNTR)

		/**
		 * Viewmodel (partial of well), used in the main view section
		 * @type {module:viewmodels/monitoring-of-well}
		 */
		this.mainVwmMonitoringOfWell = new VwmMonitoringOfWell(this.mdlStage,
				ko.observable(null),
				ko.observable(null));

		/**
		 * A monitoring record, according to the selected unix time in the wroup
		 * @type {module:models/monitoring-record}
		 */
		this.monitoringRecordForWroup = ko.computed({
				read : this.calcMonitoringRecordForWroup,
				deferEvaluation : true,
				owner : this
			});

		//} #endregion MONITORING

		//{ #region MAP

		/**
		 * A list of viewmodels of map markers
		 * @type {Array.<module:viewmodels/well-marker-of-map-of-wield>}
		 */
		this.listOfVwmMapMarker = ko.computed({
				read : this.buildListOfVwmMapMarker,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Id of the map
		 * @type {number}
		 */
		this.idOfMapOfSlcVwmMapMarker = ko.observable();

		/**
		 * A selected viewmodel of a map marker
		 * @type {module:viewmodels/well-marker-of-map-of-wield}
		 */
		this.slcVwmMapMarker = ko.computed({
				read : this.calcSlcVwmMapMarker,
				deferEvaluation : true,
				owner : this
			});

		//} #endregion MAP
    
    //{ #region SWITCHER overwriting to remove hard-code strings and ko() props in html
    console.log('history pattern', stageCnst.well.ptrn.history);
    this.isSlcPtrnWellHistory = ko.computed({
      read: this.calcIsSlcPtrn.bind(this, stageCnst.well.ptrn.history),
      deferEvaluation: true,
      owner: this
    });
    
    this.isSlcPtrnWellIntegrity = ko.computed({
      read: this.calcIsSlcPtrn.bind(this, stageCnst.well.ptrn.integrity),
      deferEvaluation: true,
      owner: this
    });
    
    this.isSlcPtrnWellLog = ko.computed({
      read: this.calcIsSlcPtrn.bind(this, stageCnst.well.ptrn.log),
      deferEvaluation: true,
      owner: this
    });
    
    this.isSlcPtrnWellNodalAnalysis = ko.computed({
      read: this.calcIsSlcPtrn.bind(this, stageCnst.well.ptrn.nodalAnalysis),
      deferEvaluation: true,
      owner: this
    });
    
    this.isSlcPtrnWellPerfomance = ko.computed({
      read: this.calcIsSlcPtrn.bind(this, stageCnst.well.ptrn.perfomance),
      deferEvaluation: true,
      owner: this
    });
    
    this.isSlcPtrnWellMap = ko.computed({
      read: this.calcIsSlcPtrn.bind(this, stageCnst.well.ptrn.map),
      deferEvaluation: true,
      owner: this
    });
    
    //{ #endregion SWITCHER
	};

	/** Inherit from a stage base viewmodel */
	appHelper.inherits(exports, VwmStageBase);

  exports.prototype.calcIsSlcPtrn = function(ptrnStr){
    return ko.unwrap(this.patternOfSlcVwmSectionWrk) === ptrnStr;
  };
  
	/** Calculate a selected marker, using id of map */
	exports.prototype.calcSlcVwmMapMarker = function () {
		var tmpIdOfMap = ko.unwrap(this.idOfMapOfSlcVwmMapMarker);
		if (tmpIdOfMap) {
			var tmpList = ko.unwrap(this.listOfVwmMapMarker);
			return tmpList.filter(function (vwmElem) {
				return vwmElem.mdlWellMarker.idOfMapOfWield === tmpIdOfMap;
			})[0];
		}
	};

	/** Select marker */
	exports.prototype.selectVwmMapMarker = function (vwmToSelect) {
		this.idOfMapOfSlcVwmMapMarker(vwmToSelect.mdlWellMarker.idOfMapOfWield);
	};

	/** Build viewmodels for map markers */
	exports.prototype.buildListOfVwmMapMarker = function () {
		var tmpList = ko.unwrap(this.mdlStage.listOfMapMarker);

		var tmpSlcVwmMapMarker = this.slcVwmMapMarker;

		return tmpList.map(function (markerModel) {
			//mdlMapOfWield, koVidOfSlcVwmMapOfWield, koTransform
			var tmpVwmMap = new VwmMapOfWield(markerModel.getWellFieldMap(), null, ko.observable({
						scale : 1,
						translate : [0, 0]
					}));

			return new VwmWellMarkerOfMapOfWield(markerModel, tmpSlcVwmMapMarker, tmpVwmMap);
		}, this);
	};

	/**
	 * Load content of the section
	 * @param {string} idOfSectionPattern - Section
	 */
	exports.prototype.loadSectionContent = function (idOfSectionPattern) {
		switch (idOfSectionPattern) {
			// Dashboard: from undefined to null
		case 'well-history': {
				this.mdlStage.loadWellHistoryList();
				break;
			}
		case 'well-sketch': {
				this.mdlStage.sketchOfWell.load();
				break;
			}
		case 'well-volume': {
				this.mdlStage.loadVolumes();
				break;
			}
		case stageCnst.well.ptrn.perfomance: {
				this.mdlStage.getWellGroup().loadListOfWfmParameterOfWroup();
				this.mdlStage.perfomanceOfWell.forecastEvolution.getDict();
				this.mdlStage.perfomanceOfWell.getHstProductionDataSet();
				break;
			}
		case 'well-nodalanalysis': {
				this.mdlStage.loadListOfNodalAnalysis();
				break;
			}
		case 'well-integrity': {
				this.mdlStage.loadListOfIntegrity();
				break;
			}
		case 'well-log': {
				this.mdlStage.loadLogsOfWell();
				break;
			}
		case 'well-test': {
				this.mdlStage.loadListOfTestScope();
				this.mdlStage.getWellGroup().loadListOfWfmParameterOfWroup();
				break;
			}
		case 'well-monitoring': {
				this.mdlStage.getWellGroup().loadListOfWfmParameterOfWroup();

				// Load procent borders for all wells
				// No perfomance when load this data separately (for every well), because
				//      a company user opens a well group monitoring section frequently than a well monitoring section
				this.mdlStage.getWellGroup().loadProcentBordersForAllWells();

				// Load monitoring records
				// There is another loader: load records for all wells, but in this case - need to reload data
				this.mainVwmMonitoringOfWell.loadFilteredListOfMonitoringRecord();

				break;
			}
		case 'well-map': {
				// find wellfield_id
				var wellFieldItem = this.mdlStage.getWellGroup().getWellField();

				wellFieldItem.loadMapsOfWield();
				////function () {
				////var arr = ko.unwrap(wellFieldItem.WellFieldMaps);
				// TODO:???
				////arr = $.grep(arr, function (arrElem, arrIndex) {
				////    var cnt = 0;
				////    $.each(arrElem.wellMarkers(), function(wwfIndex, wwfElem){
				////        if (wwfElem.Id === ths.Id) {
				////            cnt++;
				////        }
				////    });

				////    return cnt > 0;
				////});

				break;
				// no well in new map
				////wellFieldParent.initMapFileUpload();
				// find wellfieldmap from wellfield where id =
				// get all WellInWellFieldMap where wellid = ths.wellId
				// get all maps
				// get only maps where well_id == ths.Id
				// get all maps
				// in wellMarkers
			}
		}
	};

	/**
	 * Create demo records for the monitoring section
	 */
	exports.prototype.createDemoMonitoringRecords = function () {
		var curDate = new Date();
		var curUnixTime = Date.UTC(curDate.getFullYear(), curDate.getMonth(), curDate.getDate()) / 1000;
		var secondsInDay = 24 * 60 * 60;
		var startUnixTime = curUnixTime - secondsInDay * 35; // minus 50 days

		var tmpMntrParams = ko.unwrap(this.getParentVwm().mdlStage.listOfMonitoredParams);
		var ths = this;
		for (var unt = startUnixTime; unt <= curUnixTime; unt += secondsInDay) {
			// Last function for current time: reload table to get average values for the created record
			ths.mdlStage.postMonitoringRecord(unt, tmpMntrParams, generateDict(tmpMntrParams), unt === curUnixTime ? ths.getParentVwm().reloadMonitoringRecords : null);
		}
	};

	/**
	 * Create a monitoring record for selected time in well group
	 */
	exports.prototype.createMonitoringRecord = function () {
		// Time, selected in the well group of this well
		var currentUnixTimeInWroup = ko.unwrap(this.getParentVwm().monitoringUnixTime);
		if (currentUnixTimeInWroup) {

			var tmpMntrParams = ko.unwrap(this.getParentVwm().mdlStage.listOfMonitoredParams);

			// Create record with empty dictionary
			// Last parameter - function to reload table (to get average params for the new record)
			this.mdlStage.postMonitoringRecord(currentUnixTimeInWroup, tmpMntrParams, {}, this.getParentVwm().reloadMonitoringRecords);
		}
	};

	/** Calculate the record for a well group for a need time point */
	exports.prototype.calcMonitoringRecordForWroup = function () {
		var currentUnixTimeInWroup = ko.unwrap(this.getParentVwm().monitoringUnixTime);

		if (!currentUnixTimeInWroup) {
			return;
		}

		var allRecs = ko.unwrap(this.mdlStage.listOfMonitoringRecord);

		var needRec = allRecs.filter(function (recItem) {
				return ko.unwrap(recItem.unixTime) === currentUnixTimeInWroup;
			})[0];

		return needRec;
	};

	/** Create volume from file: select file and create volume */
	exports.prototype.createVolumeFromFile = function () {
		var ths = this;
		ths.unzOfSlcVwmSectionFmg(ths.mdlStage.stageKey + '-volume');

		// Calback for selected file
		function mgrCallback() {
			ths.fmgrModal.okError('');

			var tmpSlcVwmSection = ko.unwrap(ths.slcVwmSectionFmg);

			if (!tmpSlcVwmSection) {
				throw new Error('No selected section');
			}

			// Select file from file manager
			var selectedFileSpecs = ko.unwrap(tmpSlcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
					return ko.unwrap(elem.isSelected);
				});

			if (selectedFileSpecs.length !== 1) {
				ths.fmgrModal.okError('need to select one file');
				return;
			}

			ths.mdlStage.postVolumeOfWell(selectedFileSpecs[0].id, ko.unwrap(selectedFileSpecs[0].name), function () {
				// Success
				ths.fmgrModal.hide();
			}, function (jqXhr) {
				// Error
				if (jqXhr.status === 422) {
					var resJson = jqXhr.responseJSON;
					require(['helpers/lang-helper'], function (langHelper) {
						var tmpProcessError = (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
						ths.fmgrModal.okError(tmpProcessError);
					});
				}
			});
		}

		// Add to observable
		ths.fmgrModal.okCallback(mgrCallback);

		// Notification
		ths.fmgrModal.okDescription('Please select a file for a volume');

		// Open file manager
		ths.fmgrModal.show();
	};

	/**
	 * Create log of well
	 */
	exports.prototype.createLogOfWellFromFileSpec = function () {
		var ths = this;
		ths.unzOfSlcVwmSectionFmg(ths.mdlStage.stageKey + '-log');

		// 1. Select file
		// 2. Show column attributes modal window

		// Calback for selected file
		function mgrCallback() {
			ths.fmgrModal.okError('');

			var tmpSlcVwmSection = ko.unwrap(ths.slcVwmSectionFmg);

			if (!tmpSlcVwmSection) {
				throw new Error('No selected section');
			}

			// Select file from file manager
			var selectedFileSpecs = ko.unwrap(tmpSlcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
					return ko.unwrap(elem.isSelected);
				});

			if (selectedFileSpecs.length !== 1) {
				ths.fmgrModal.okError('need to select one file');
				return;
			}

			var tmpFileSpec = selectedFileSpecs[0];

			ths.mdlStage.getLogColumnAttributes(tmpSlcVwmSection.mdlSection.id, tmpFileSpec.id, function (columnAttributes) {
				ths.fmgrModal.hide();

				// TODO: Style decor for attribute selection
				var selectDepth = document.createElement('select');
				$(selectDepth).addClass('pd-parameter');

				var selectSP = document.createElement('select');
				$(selectSP).addClass('pd-parameter');

				var selectGR = document.createElement('select');
				$(selectGR).addClass('pd-parameter');

				var selectRS = document.createElement('select');
				$(selectRS).addClass('pd-parameter');

				for (var caIndex = 0, caMaxIndex = columnAttributes.length; caIndex < caMaxIndex; caIndex++) {
					var optionColumnAttribute = document.createElement('option');
					$(optionColumnAttribute)
					.val(columnAttributes[caIndex].Id)
					.html(columnAttributes[caIndex].Name + (columnAttributes[caIndex].Format() ? (', ' + columnAttributes[caIndex].Format()) : ''));

					switch (columnAttributes[caIndex].Name) {
					case 'DEPTH':
					case 'DEPT':
						selectDepth.appendChild(optionColumnAttribute);
						break;
					case 'SP':
					case 'SPC':
						selectSP.appendChild(optionColumnAttribute);
						break;
					case 'GR':
					case 'HGRT':
					case 'GRDS':
					case 'SGR':
					case 'NGRT':
						selectGR.appendChild(optionColumnAttribute);
						break;
					case 'RS':
					case 'RES':
					case 'RESD':
						selectRS.appendChild(optionColumnAttribute);
						break;
					}
				}

				var innerDiv = document.createElement('div');
				$(innerDiv).addClass('form-horizontal').append(
					bootstrapModal.gnrtDom('Depth', selectDepth),
					bootstrapModal.gnrtDom('GR', selectGR),
					bootstrapModal.gnrtDom('SP', selectSP),
					bootstrapModal.gnrtDom('Resistivity', selectRS));

				function submitFunction() {
					var selectedArray = $(innerDiv).find('.pd-parameter').map(function () {
							return $(this).val();
						}).get();

					if (selectedArray.length < 4) {
						alert('All fields required');
						return;
					}

					// 3. Select column attributes
					// 4. Add new log

					ths.mdlStage.postLogOfWell(tmpFileSpec.id, ko.unwrap(tmpFileSpec.name), selectedArray);

					bootstrapModal.closeModalWindow();
				}

				bootstrapModal.openModalWindow('Column match', innerDiv, submitFunction);
			});
		}

		// Add to observable
		ths.fmgrModal.okCallback(mgrCallback);

		// Notification
		ths.fmgrModal.okDescription('Please select a file for a log');

		// Open file manager
		ths.fmgrModal.show();
	};

	/**
	 * Create model and viewmodel of nodal analysis
	 */
	exports.prototype.postVwmNodalAnalysis = function () {
		var ths = this;
		ths.unzOfSlcVwmSectionFmg(ths.mdlStage.stageKey + '-nodalanalysis');

		// Calback for selected file
		function mgrCallback() {
			ths.fmgrModal.okError('');

			var tmpSlcVwmSection = ko.unwrap(ths.slcVwmSectionFmg);

			if (!tmpSlcVwmSection) {
				throw new Error('No selected section');
			}

			// Select file from file manager
			var selectedFileSpecs = ko.unwrap(tmpSlcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
					return ko.unwrap(elem.isSelected);
				});

			if (selectedFileSpecs.length !== 1) {
				ths.fmgrModal.okError('need to select one file');
				return;
			}

			ths.mdlStage.postNodalAnalysis(selectedFileSpecs[0].id, ko.unwrap(selectedFileSpecs[0].name), '', function () {
				// Success
				ths.fmgrModal.hide();
			}, function (jqXhr) {
				// Error
				if (jqXhr.status === 422) {
					var resJson = jqXhr.responseJSON;
					require(['helpers/lang-helper'], function (langHelper) {
						var tmpProcessError = (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
						ths.fmgrModal.okError(tmpProcessError);
					});
				}
			});
		}

		// Add to observable
		ths.fmgrModal.okCallback(mgrCallback);

		// Notification
		ths.fmgrModal.okDescription('Please select a file for a nodal analysis');

		// Open file manager
		ths.fmgrModal.show();
	};

	/**
	 * Create model and viewmodel of integrity
	 */
	exports.prototype.postVwmIntegrity = function () {
		var ths = this;
		ths.unzOfSlcVwmSectionFmg(ths.mdlStage.stageKey + '-integrity');

		// Calback for selected file
		function mgrCallback() {
			ths.fmgrModal.okError('');

			var tmpSlcVwmSection = ko.unwrap(ths.slcVwmSectionFmg);

			if (!tmpSlcVwmSection) {
				throw new Error('No selected section');
			}

			// Select file from file manager
			var selectedFileSpecs = ko.unwrap(tmpSlcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
					return ko.unwrap(elem.isSelected);
				});

			if (selectedFileSpecs.length !== 1) {
				ths.fmgrModal.okError('need to select one file');
				return;
			}

			ths.mdlStage.postIntegrity(selectedFileSpecs[0].id, ko.unwrap(selectedFileSpecs[0].name), '', function () {
				// Success
				ths.fmgrModal.hide();
			}, function (jqXhr) {
				// Error
				if (jqXhr.status === 422) {
					var resJson = jqXhr.responseJSON;
					require(['helpers/lang-helper'], function (langHelper) {
						var tmpProcessError = (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
						ths.fmgrModal.okError(tmpProcessError);
					});
				}
			});
		}

		// Add to observable
		ths.fmgrModal.okCallback(mgrCallback);

		// Notification
		ths.fmgrModal.okDescription('Please select an integrity file');

		// Open file manager
		ths.fmgrModal.show();
	};

	//{ #region VOLUME-METHODS

	/**
	 * Build a list of viewmodels of volumes
	 * @returns {Array.<viewmodels/volume-of-well>}
	 */
	exports.prototype.buildListOfVwmVolumeOfWell = function () {
		return ko.unwrap(this.mdlStage.volumes).map(function (elem) {
			return new VwmVolumeOfWell(elem, this.vidOfSlcVwmVolumeOfWell);
		}, this);
	};

	/**
	 * Calculate a selected volume
	 * @returns {module:viewmodels/volume-of-well}
	 */
	exports.prototype.calcSlcVwmVolumeOfWell = function () {
		var tmpVid = ko.unwrap(this.vidOfSlcVwmVolumeOfWell);

		var tmpList = ko.unwrap(this.listOfVwmVolumeOfWell);
		if (tmpVid) {
			return tmpList.filter(function (elem) {
				return elem.vid === tmpVid;
			})[0];
		} else {
			if (tmpList.length > 0) {
				// Computed observables doesn't execute from themself
				this.vidOfSlcVwmVolumeOfWell(tmpList[0].vid);
				return tmpList[0];
			}
			// Select first element, if no selected
			//   return tmpList[0];
		}
	};

	/** Select view for volume of well */
	exports.prototype.selectVwmVolumeOfWell = function (tmpVwm) {
		this.vidOfSlcVwmVolumeOfWell(tmpVwm.vid);
	};

	/**
	 * Remove viewmodel and model of volume
	 */
	exports.prototype.removeVwmVolumeOfWell = function (vwmToRemove) {
		if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(vwmToRemove.mdlVolumeOfWell.name) + '"?')) {
			this.mdlStage.removeVolumeOfWell(vwmToRemove.mdlVolumeOfWell);
		}
	};

	//} #endregion VOLUME-METHODS

	return exports;
});
