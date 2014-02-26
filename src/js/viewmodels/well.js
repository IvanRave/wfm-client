/**
 * @module
 * @todo feat: map widget #MM!
 *             using only maps with this well
 */
define([
		'jquery',
		'knockout',
		'helpers/modal-helper',
		'viewmodels/bases/stage-base',
		'viewmodels/sketch-of-well',
		'viewmodels/volume-of-well',
		'viewmodels/scope-of-history-of-well',
		'viewmodels/log-of-well',
		'viewmodels/nodal-analysis-of-well',
		'viewmodels/integrity-of-well',
		'viewmodels/perfomance-of-well',
		'viewmodels/test-scope',
		'viewmodels/monitoring-of-well'],
	function (
		$,
		ko,
		bootstrapModal,
		VwmStageBase,
		VwmSketchOfWell,
		VwmVolumeOfWell,
		VwmScopeOfHistoryOfWell,
		VwmLogOfWell,
		VwmNodalAnalysis,
		VwmIntegrity,
		VwmPerfomanceOfWell,
		VwmTestScope,
		VwmMonitoringOfWell) {
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
	 */
	var exports = function (mdlWell, parentVwmWroup, defaultSlcData) {
		var ths = this;

		this.mdlStage = mdlWell;

		this.unq = mdlWell.id;

		this.fmgr = parentVwmWroup.fmgr;

		/**
		 * Get parent viewmodel (wroup)
		 */
		this.getParentVwm = function () {
			return parentVwmWroup;
		};

		// Has sections and widgets
		VwmStageBase.call(this, defaultSlcData.wellSectionId, parentVwmWroup.unqOfSlcVwmChild);

		/**
		 * Select all ancestor's view models
		 */
		this.selectAncestorVwms = function () {
			parentVwmWroup.unqOfSlcVwmChild(ths.unq);
			parentVwmWroup.selectAncestorVwms();
		};

		//mdlSketchOfWell, koWellUnzOfSlcVwmSectionFmg, koSlcVwmSectionFmg,  fmgrLink
		this.vwmSketchOfWell = new VwmSketchOfWell(ths.mdlStage.sketchOfWell, ths.unzOfSlcVwmSectionFmg, ths.slcVwmSectionFmg, ths.fmgr);

		//{ #region VOLUME

		/**
		 * List of views of volume of well
		 * @type {Array.<viewmodels/volume-of-well>}
		 */
		this.listOfVwmVolumeOfWell = ko.computed({
				read : function () {
					return ko.unwrap(ths.mdlStage.volumes).map(function (elem) {
						return new VwmVolumeOfWell(elem, ths.vidOfSlcVwmVolumeOfWell);
					});
				},
				deferEvaluation : true
			});

		/**
		 * Id of selected view, equals id of file spec (guid)
		 * @type {string}
		 */
		this.vidOfSlcVwmVolumeOfWell = ko.observable();

		/**
		 * Selected view
		 */
		this.slcVwmVolumeOfWell = ko.computed({
				read : function () {
					var tmpVid = ko.unwrap(ths.vidOfSlcVwmVolumeOfWell);
					console.log('computed: volume', tmpVid);
					var tmpList = ko.unwrap(ths.listOfVwmVolumeOfWell);
					if (tmpVid) {
						return tmpList.filter(function (elem) {
							return elem.vid === tmpVid;
						})[0];
					} else {
						if (tmpList.length > 0) {
							// Computed observables doesn't execute from themself
							ths.vidOfSlcVwmVolumeOfWell(tmpList[0].vid);
							return tmpList[0];
						}
						// Select first element, if no selected
						//   return tmpList[0];
					}
				},
				deferEvaluation : true
			});

		/** Select view for volume of well */
		this.selectVwmVolumeOfWell = function (tmpVwm) {
			ths.vidOfSlcVwmVolumeOfWell(tmpVwm.vid);
		};

		/** Create volume from file: select file and create volume */
		this.createVolumeFromFile = function () {
			ths.unzOfSlcVwmSectionFmg(ths.mdlStage.stageKey + '-volume');

			// Calback for selected file
			function mgrCallback() {
				ths.fmgr.okError('');

				var tmpSlcVwmSection = ko.unwrap(ths.slcVwmSectionFmg);

				if (!tmpSlcVwmSection) {
					throw new Error('No selected section');
				}

				// Select file from file manager
				var selectedFileSpecs = ko.unwrap(tmpSlcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
						return ko.unwrap(elem.isSelected);
					});

				if (selectedFileSpecs.length !== 1) {
					ths.fmgr.okError('need to select one file');
					return;
				}

				ths.mdlStage.postVolumeOfWell(selectedFileSpecs[0].id, ko.unwrap(selectedFileSpecs[0].name), function () {
					// Success
					ths.fmgr.hide();
				}, function (jqXhr) {
					// Error
					if (jqXhr.status === 422) {
						var resJson = jqXhr.responseJSON;
						require(['helpers/lang-helper'], function (langHelper) {
							var tmpProcessError = (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
							ths.fmgr.okError(tmpProcessError);
						});
					}
				});
			}

			// Add to observable
			ths.fmgr.okCallback(mgrCallback);

			// Notification
			ths.fmgr.okDescription('Please select a file for a volume');

			// Open file manager
			ths.fmgr.show();
		};

		/**
		 * Remove viewmodel and model of volume
		 */
		this.removeVwmVolumeOfWell = function (vwmToRemove) {
			if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(vwmToRemove.mdlVolumeOfWell.name) + '"?')) {
				ths.mdlStage.removeVolumeOfWell(vwmToRemove.mdlVolumeOfWell);
			}
		};

		//} #endregion VOLUME

		//{ #region HISTORY

		this.vwmScopeOfHistoryOfWell = new VwmScopeOfHistoryOfWell({}, ths);

		//} #endregion HISTORY

		//{ #region LOG

		/**
		 * List of viewmodels of log of well
		 * @type {Array.<module:viewmodels/log-of-well>}
		 */
		this.listOfVwmLogOfWell = ko.computed({
				read : function () {
					return ko.unwrap(mdlWell.logsOfWell).map(function (elem) {
						return new VwmLogOfWell(elem, ths.vidOfSlcVwmLogOfWell);
					});
				},
				deferEvaluation : true
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

		/**
		 * Create log of well
		 */
		this.createLogOfWellFromFileSpec = function () {
			ths.unzOfSlcVwmSectionFmg(ths.mdlStage.stageKey + '-log');

			// 1. Select file
			// 2. Show column attributes modal window

			// Calback for selected file
			function mgrCallback() {
				ths.fmgr.okError('');

				var tmpSlcVwmSection = ko.unwrap(ths.slcVwmSectionFmg);

				if (!tmpSlcVwmSection) {
					throw new Error('No selected section');
				}

				// Select file from file manager
				var selectedFileSpecs = ko.unwrap(tmpSlcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
						return ko.unwrap(elem.isSelected);
					});

				if (selectedFileSpecs.length !== 1) {
					ths.fmgr.okError('need to select one file');
					return;
				}

				var tmpFileSpec = selectedFileSpecs[0];

				ths.mdlStage.getLogColumnAttributes(tmpSlcVwmSection.mdlSection.id, tmpFileSpec.id, function (columnAttributes) {
					ths.fmgr.hide();

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

						mdlWell.postLogOfWell(tmpFileSpec.id, ko.unwrap(tmpFileSpec.name), selectedArray);

						bootstrapModal.closeModalWindow();
					}

					bootstrapModal.openModalWindow('Column match', innerDiv, submitFunction);
				});
			}

			// Add to observable
			ths.fmgr.okCallback(mgrCallback);

			// Notification
			ths.fmgr.okDescription('Please select a file for a log');

			// Open file manager
			ths.fmgr.show();
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
		 * Create model and viewmodel of nodal analysis
		 */
		this.postVwmNodalAnalysis = function () {
			ths.unzOfSlcVwmSectionFmg(ths.mdlStage.stageKey + '-nodalanalysis');

			// Calback for selected file
			function mgrCallback() {
				ths.fmgr.okError('');

				var tmpSlcVwmSection = ko.unwrap(ths.slcVwmSectionFmg);

				if (!tmpSlcVwmSection) {
					throw new Error('No selected section');
				}

				// Select file from file manager
				var selectedFileSpecs = ko.unwrap(tmpSlcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
						return ko.unwrap(elem.isSelected);
					});

				if (selectedFileSpecs.length !== 1) {
					ths.fmgr.okError('need to select one file');
					return;
				}

				ths.mdlStage.postNodalAnalysis(selectedFileSpecs[0].id, ko.unwrap(selectedFileSpecs[0].name), '', function () {
					// Success
					ths.fmgr.hide();
				}, function (jqXhr) {
					// Error
					if (jqXhr.status === 422) {
						var resJson = jqXhr.responseJSON;
						require(['helpers/lang-helper'], function (langHelper) {
							var tmpProcessError = (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
							ths.fmgr.okError(tmpProcessError);
						});
					}
				});
			}

			// Add to observable
			ths.fmgr.okCallback(mgrCallback);

			// Notification
			ths.fmgr.okDescription('Please select a file for a nodal analysis');

			// Open file manager
			ths.fmgr.show();
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
		 * Create model and viewmodel of integrity
		 */
		this.postVwmIntegrity = function () {
			ths.unzOfSlcVwmSectionFmg(ths.mdlStage.stageKey + '-integrity');

			// Calback for selected file
			function mgrCallback() {
				ths.fmgr.okError('');

				var tmpSlcVwmSection = ko.unwrap(ths.slcVwmSectionFmg);

				if (!tmpSlcVwmSection) {
					throw new Error('No selected section');
				}

				// Select file from file manager
				var selectedFileSpecs = ko.unwrap(tmpSlcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
						return ko.unwrap(elem.isSelected);
					});

				if (selectedFileSpecs.length !== 1) {
					ths.fmgr.okError('need to select one file');
					return;
				}

				ths.mdlStage.postIntegrity(selectedFileSpecs[0].id, ko.unwrap(selectedFileSpecs[0].name), '', function () {
					// Success
					ths.fmgr.hide();
				}, function (jqXhr) {
					// Error
					if (jqXhr.status === 422) {
						var resJson = jqXhr.responseJSON;
						require(['helpers/lang-helper'], function (langHelper) {
							var tmpProcessError = (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
							ths.fmgr.okError(tmpProcessError);
						});
					}
				});
			}

			// Add to observable
			ths.fmgr.okCallback(mgrCallback);

			// Notification
			ths.fmgr.okDescription('Please select a file for a integrity');

			// Open file manager
			ths.fmgr.show();
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

		this.mainVwmPerfomanceOfWell = new VwmPerfomanceOfWell({
				isVisibleForecastData : false
			}, ths.mdlStage.perfomanceOfWell, ths);

		//} #endregion PERFOMANCE

		//{ #region TEST

		this.listOfVwmTestScope = ko.computed({
				read : function () {
					return ko.unwrap(ths.mdlStage.listOfTestScope).map(function (elem) {
						return new VwmTestScope(elem);
					});
				},
				deferEvaluation : true
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
		this.mainVwmMonitoringOfWell = new VwmMonitoringOfWell({
				// some options, like startUnixTime, endUnixTime
				// can be loaded from cookies or setting by default, for example:
				// for the last month period
				// neccessary for widget
			}, ths.mdlStage, parentVwmWroup.listOfMonitoredVwmParams);

		/**
		 * A monitoring record, according to the selected unix time in the wroup
		 * @type {module:models/monitoring-record}
		 */
		this.monitoringRecordForWroup = ko.computed({
				read : function () {
					var currentUnixTimeInWroup = ko.unwrap(parentVwmWroup.monitoringUnixTime);

					if (!currentUnixTimeInWroup) {
						return;
					}

					var allRecs = ko.unwrap(ths.mdlStage.listOfMonitoringRecord);

					var needRec = allRecs.filter(function (recItem) {
							return ko.unwrap(recItem.unixTime) === currentUnixTimeInWroup;
						})[0];

					return needRec;
				},
				deferEvaluation : true
			});

		/**
		 * Create a monitoring record for selected time in well group
		 */
		this.createMonitoringRecord = function () {
			// Time, selected in the well group of this well
			var currentUnixTimeInWroup = ko.unwrap(parentVwmWroup.monitoringUnixTime);
			if (currentUnixTimeInWroup) {

				var tmpMntrParams = ko.unwrap(ths.getParentVwm().listOfMonitoredVwmParams).map(function (elem) {
						return elem.mdlWfmParameterOfWroup;
					});

				// Create record with empty dictionary
				// Last parameter - function to reload table (to get average params for the new record)
				ths.mdlStage.postMonitoringRecord(currentUnixTimeInWroup, tmpMntrParams, {}, parentVwmWroup.reloadMonitoringRecords);
			}
		};

		/**
		 * Remove all records: ovveride the model method with a confirmation and checking
		 */
		this.removeAllMonitoringRecords = function () {
			if (confirm('{{capitalizeFirst lang.confirmToDelete}} all records for this well for all time?')) {
				ths.mdlStage.removeAllMonitoringRecords();
			}
		};

		/**
		 * Create demo records for the monitoring section
		 */
		this.createDemoMonitoringRecords = function () {
			var curDate = new Date();
			var curUnixTime = Date.UTC(curDate.getFullYear(), curDate.getMonth(), curDate.getDate()) / 1000;
			var secondsInDay = 24 * 60 * 60;
			var startUnixTime = curUnixTime - secondsInDay * 35; // minus 50 days

			var tmpMntrParams = ko.unwrap(ths.getParentVwm().listOfMonitoredVwmParams).map(function (elem) {
					return elem.mdlWfmParameterOfWroup;
				});

			for (var unt = startUnixTime; unt <= curUnixTime; unt += secondsInDay) {
				// Last function for current time: reload table to get average values for the created record
				ths.mdlStage.postMonitoringRecord(unt, tmpMntrParams, generateDict(tmpMntrParams), unt === curUnixTime ? parentVwmWroup.reloadMonitoringRecords : null);
			}
		};

		//{

		/**
		 * Load content of the section
		 * @param {object} section - Section
		 */
		this.loadSectionContent = function (idOfSectionPattern) {
			switch (idOfSectionPattern) {
				// Dashboard: from undefined to null
			case 'well-history': {
					ths.mdlStage.loadWellHistoryList();
					break;
				}
			case 'well-sketch': {
					ths.mdlStage.sketchOfWell.load();
					break;
				}
			case 'well-volume': {
					ths.mdlStage.loadVolumes();
					break;
				}
			case 'well-perfomance': {
					ths.mdlStage.getWellGroup().loadListOfWfmParameterOfWroup();
					ths.mdlStage.perfomanceOfWell.forecastEvolution.getDict();
					ths.mdlStage.perfomanceOfWell.getHstProductionDataSet();
					break;
				}
			case 'well-nodalanalysis': {
					ths.mdlStage.loadListOfNodalAnalysis();
					break;
				}
			case 'well-integrity': {
					ths.mdlStage.loadListOfIntegrity();
					break;
				}
			case 'well-log': {
					ths.mdlStage.loadLogsOfWell();
					break;
				}
			case 'well-test': {
					ths.mdlStage.loadListOfTestScope();
					ths.mdlStage.getWellGroup().loadListOfWfmParameterOfWroup();
					break;
				}
			case 'well-monitoring': {
					ths.mdlStage.getWellGroup().loadListOfWfmParameterOfWroup();

					// Load procent borders for all wells
					// No perfomance when load this data separately (for every well), because
					//      a company user opens a well group monitoring section frequently than a well monitoring section
					ths.mdlStage.getWellGroup().loadProcentBordersForAllWells();

					// Load monitoring records
					// There is another loader: load records for all wells, but in this case - need to reload data
					ths.mainVwmMonitoringOfWell.loadFilteredListOfMonitoringRecord();

					break;
				}
			case 'well-map': {
					// find wellfield_id
					var wellFieldItem = ths.mdlStage.getWellGroup().getWellField();

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
	};

	return exports;
});
