/** @module */
define([
		'jquery',
		'knockout',
		'services/datacontext',
		'helpers/file-helper',
		'helpers/app-helper',
		'moment',
		'models/bases/stage-base',
		'models/perfomance-of-well',
		'models/section-of-stage',
		'models/sketch-of-well',
		'models/prop-spec',
		'services/well',
		'models/integrity-of-well',
		'services/integrity-of-well',
		'models/nodal-analysis-of-well',
		'services/nodal-analysis-of-well',
		'constants/stage-constants',
		'models/volume-of-well',
		'services/volume-of-well',
		'models/history-of-well',
		'models/log-of-well',
		'services/log-of-well',
		'services/file-spec',
		'models/column-attribute',
		'models/test-scope',
		'services/test-scope',
		'models/procent-border',
		'services/procent-border',
		'models/monitoring-record',
		'services/monitoring-record'
	], function ($, ko, datacontext, fileHelper,
		appHelper, appMoment,
		StageBase,
		PerfomanceOfWell,
		SectionOfWell, SketchOfWell,
		PropSpec, wellService,
		IntegrityOfWell, integrityOfWellService,
		NodalAnalysisOfWell, nodalAnalysisOfWellService,
		stageConstants, VolumeOfWell,
		volumeOfWellService, HistoryOfWell,
		LogOfWell, logOfWellService,
		fileSpecService, ColumnAttribute, TestScope, testScopeService,
		ProcentBorder, procentBorderService,
		MonitoringRecord, monitoringRecordService) {
	'use strict';

	function importVolumes(data) {
		return (data || []).map(function (item) {
			return new VolumeOfWell(item);
		});
	}

	function importLogsOfWell(data) {
		return (data || []).map(function (item) {
			return new LogOfWell(item);
		});
	}

	function importListOfNodalAnalysisOfWell(data) {
		return (data || []).map(function (item) {
			return new NodalAnalysisOfWell(item);
		});
	}

	function importListOfIntegrityOfWell(data) {
		return (data || []).map(function (item) {
			return new IntegrityOfWell(item);
		});
	}

	/** ColumnAttributes (convert data objects into array) */
	function importColumnAttributes(data) {
		return data.map(function (item) {
			return new ColumnAttribute(item);
		});
	}

	/** WellHistory (convert data objects into array) */
	function importWellHistoryDto(data, parent) {
		return data.map(function (item) {
			return new HistoryOfWell(item, parent);
		});
	}

	/** Test scope */
	function importTestScopeDtoList(data, wellItem) {
		return data.map(function (item) {
			return new TestScope(item, wellItem);
		});
	}

	/** Import all sections of well */
	function importListOfSection(data, wellItem) {
		return data.map(function (item) {
			return new SectionOfWell(item, wellItem);
		});
	}

	/** Get well map list from well field maps with need well id */
	function getWellMapList(wellFieldMapList, wellId) {
		return $.grep(wellFieldMapList, function (elemValue) {
			var tmpWellMarkers = ko.unwrap(elemValue.wellMarkers);

			var wellIdList = tmpWellMarkers.map(function (wfmElem) {
					return ko.unwrap(wfmElem.WellId);
				});

			return $.inArray(wellId, wellIdList) >= 0;
		});
	}

	/** Well property specifications: will be good to manage this params on the server side */
	var wellPropSpecList = [
		new PropSpec('Name', 'Name', 'Well name', 'SingleLine', {
			maxLength : 255
		}),
		new PropSpec('Description', 'Description', 'Description', 'MultiLine', {}),
		new PropSpec('IsActive', 'IsActive', 'Is active', 'BoolLine', {}),
		new PropSpec('DrillingDate', 'DrillingDate', 'Drilling date', 'DateLine', {}),
		new PropSpec('ProductionHistory', 'ProductionHistory', 'Production history', 'MultiLine', {}),
		new PropSpec('CompletionType', 'CompletionType', 'Completion type', 'MultiLine', {}),
		new PropSpec('FormationCompleteState', 'FormationCompleteState', 'Formation complete state', 'MultiLine', {}),
		new PropSpec('IntegrityStatus', 'IntegrityStatus', 'Integrity status', 'MultiLine', {}),
		new PropSpec('LastInterventionType', 'LastInterventionType', 'Last intervention type', 'MultiLine', {}),
		new PropSpec('LastInterventionDate', 'LastInterventionDate', 'Last intervention date', 'DateLine', {}),
		new PropSpec('PerforationDepth', 'PerforationDepth', 'Perforation depth', 'MultiLine', {}),
		new PropSpec('PressureData', 'PressureData', 'Pressure data', 'MultiLine', {}),
		new PropSpec('Pvt', 'Pvt', 'PVT', 'MultiLine', {}),
		new PropSpec('ReservoirData', 'ReservoirData', 'Reservoir data', 'MultiLine', {})
	];

	/**
	 * Well model
	 * @param {object} data - Well data
	 * @param {WellGroup} wellGroup - Well group
	 * @constructor
	 */
	var exports = function (data, wellGroup) {
		data = data || {};

		var ths = this;

		/** Get well group */
		this.getWellGroup = function () {
			return wellGroup;
		};

		/** Get workspace view model */
		this.getRootMdl = function () {
			return this.getWellGroup().getRootMdl();
		};

		/**
		 * Well id
		 * @type {number}
		 */
		this.Id = data.Id;

		/** Alternative for caps Id */
		this.id = data.Id;

		/**
		 * Well type
		 * @type {string}
		 */
		this.WellType = ko.observable(data.WellType);

		/**
		 * Flow type
		 * @type {string}
		 */
		this.FlowType = ko.observable(data.FlowType);

		/** Well property specifications */
		this.propSpecList = wellPropSpecList;

		/**
		 * Stage key: equals file name
		 * @type {string}
		 */
		this.stageKey = stageConstants.well.id;

		/** Add props to constructor */
		StageBase.call(this, data);

		/**
		 * Well comment
		 * @type {string}
		 */
		this.Comment = ko.observable(data.Comment);

		/**
		 * Well group id (foreign key - parent)
		 * @type {number}
		 */
		this.WellGroupId = data.WellGroupId;

		/**
		 * Field maps for this well
		 * @type {Array.<WellFieldMap>}
		 */
		this.wellMapList = ko.computed({
				read : function () {
					return getWellMapList(ko.unwrap(this.getWellGroup().getWellField().WellFieldMaps), this.Id);
				},
				deferEvaluation : true,
				owner : this
			});

		/** Sketch of well: by default - empty */
		this.sketchOfWell = new SketchOfWell(ths);

		this.loadDashboard = function () {
			ths.sketchOfWell.load();
			// TODO: load data only if there is one or more perfomance widgets (only once) for entire well
			ths.getWellGroup().loadListOfWfmParameterOfWroup();
			ths.perfomanceOfWell.forecastEvolution.getDict();
			ths.perfomanceOfWell.getHstProductionDataSet();
			ths.loadWellHistoryList();
		};

		/** Save this well main properties */
		this.save = function () {
			wellService.put(ths.id, ths.toDto());
		};

		this.wellMarkers = ko.observableArray();

		//{ #region TEST

		this.listOfTestScope = ko.observableArray();

		this.loadListOfTestScope = function () {
			testScopeService.get(ths.id).done(function (response) {
				ths.listOfTestScope(importTestScopeDtoList(response, ths));
			});
		};

		/**
		 * Last approved test scope for potential section in well group
		 * @type {module:models/test-scope}
		 */
		this.lastApprovedTestScope = ko.computed({
				read : function () {
					var tmpApprovedList = ko.unwrap(ths.listOfTestScope).filter(function (elem) {
							return ko.unwrap(elem.isApproved) === true;
						});

					var lastTestScope = tmpApprovedList[0];

					// Find last (by time) test scope
					tmpApprovedList.forEach(function (elem) {
						if (ko.unwrap(elem.startUnixTime) > ko.unwrap(lastTestScope.startUnixTime)) {
							lastTestScope = elem;
						}
					});

					return lastTestScope;
				},
				deferEvaluation : true
			});

		/** Unix time data for creating new test scope */
		this.testScopeNewStartUnixTime = {
			unixDate : ko.observable(),
			hour : ko.observable(0),
			minute : ko.observable(0)
		};

		this.isEnabledPostTestScope = ko.computed({
				read : function () {
					if (ko.unwrap(ths.testScopeNewStartUnixTime.unixDate)) {
						if (ko.unwrap(ths.testScopeNewStartUnixTime.hour) >= 0) {
							if (ko.unwrap(ths.testScopeNewStartUnixTime.minute) >= 0) {
								return true;
							}
						}
					}

					return false;
				},
				deferEvaluation : true
			});

		/** Post test scope to server */
		this.postTestScope = function () {
			if (ths.isEnabledPostTestScope) {
				// Date in UTC second
				var unixTime = ko.unwrap(ths.testScopeNewStartUnixTime.unixDate);

				// Remove UTC offset
				// in seconds
				unixTime += new Date(unixTime * 1000).getTimezoneOffset() * 60;

				// Add hours
				unixTime += ko.unwrap(ths.testScopeNewStartUnixTime.hour) * 3600;
				// Add minutes
				unixTime += ko.unwrap(ths.testScopeNewStartUnixTime.minute) * 60;

				testScopeService.post({
					WellId : ths.id,
					StartUnixTime : unixTime,
					IsApproved : null,
					ConductedBy : '',
					CertifiedBy : ''
				}).done(function (response) {
					ths.listOfTestScope.unshift(new TestScope(response, ths));
				});
			}
		};

		//} #endregion TEST

		//{ #region LOG

		/**
		 * Well logs
		 * @type {Array.<module:models/log-of-well>}
		 */
		this.logsOfWell = ko.observableArray();

		/**
		 * Whether well logs are loaded
		 * @type {boolean}
		 */
		this.isLoadedLogsOfWell = ko.observable(false);

		/** Load well logs */
		this.loadLogsOfWell = function () {
			if (ko.unwrap(ths.isLoadedLogsOfWell)) {
				return;
			}

			logOfWellService.get(ths.id).done(function (res) {
				ths.logsOfWell(importLogsOfWell(res));
				ths.isLoadedLogsOfWell(true);
			});
		};

		/**
		 * Get columns for log file
		 */
		this.getLogColumnAttributes = function (idOfNeedSection, idOfFileSpec, scsCallback) {
			fileSpecService.getColumnAttributes(ths.stageKey, idOfNeedSection, idOfFileSpec).done(function (res) {
				// ColumnAttributes (convert data objects into array)
				scsCallback(importColumnAttributes(res));
			});
		};

		/**
		 * Create log of well
		 */
		this.postLogOfWell = function (tmpIdOfFileSpec, tmpName, selectedArray) {
			logOfWellService.post(ths.id, {
				IdOfWell : ths.id,
				IdOfFileSpec : tmpIdOfFileSpec,
				Name : tmpName,
				Description : selectedArray.join(',')
			}).done(function (createdDataOfLogOfWell) {
				// Add to the list
				ths.logsOfWell.push(new LogOfWell(createdDataOfLogOfWell));
			});
		};

		////        fileSpecService.getColumnAttributes(ths.stageKey, needSection.id, tmpFileSpec.id).done(function (res) {
		////            // ColumnAttributes (convert data objects into array)
		////            var columnAttributes = importColumnAttributes(res);

		////            // TODO: Style decor for attribute selection
		////            var selectDepth = document.createElement('select');
		////            $(selectDepth).addClass('pd-parameter');

		////            var selectSP = document.createElement('select');
		////            $(selectSP).addClass('pd-parameter');

		////            var selectGR = document.createElement('select');
		////            $(selectGR).addClass('pd-parameter');

		////            var selectRS = document.createElement('select');
		////            $(selectRS).addClass('pd-parameter');

		////            for (var caIndex = 0, caMaxIndex = columnAttributes.length; caIndex < caMaxIndex; caIndex++) {
		////                var optionColumnAttribute = document.createElement('option');
		////                $(optionColumnAttribute)
		////                    .val(columnAttributes[caIndex].Id)
		////                    .html(columnAttributes[caIndex].Name + (columnAttributes[caIndex].Format() ? (', ' + columnAttributes[caIndex].Format()) : ''));

		////                switch (columnAttributes[caIndex].Name) {
		////                    case 'DEPTH': case 'DEPT': selectDepth.appendChild(optionColumnAttribute); break;
		////                    case 'SP': case 'SPC': selectSP.appendChild(optionColumnAttribute); break;
		////                    case 'GR': case 'HGRT': case 'GRDS': case 'SGR': case 'NGRT': selectGR.appendChild(optionColumnAttribute); break;
		////                    case 'RS': case 'RES': case 'RESD': selectRS.appendChild(optionColumnAttribute); break;
		////                }
		////            }

		////            var innerDiv = document.createElement('div');
		////            $(innerDiv).addClass('form-horizontal').append(
		////                bootstrapModal.gnrtDom('Depth', selectDepth),
		////                bootstrapModal.gnrtDom('GR', selectGR),
		////                bootstrapModal.gnrtDom('SP', selectSP),
		////                bootstrapModal.gnrtDom('Resistivity', selectRS)
		////            );

		////            function submitFunction() {
		////                var selectedArray = $(innerDiv).find('.pd-parameter').map(function () {
		////                    return $(this).val();
		////                }).get();

		////                if (selectedArray.length < 4) {
		////                    alert('All fields required');
		////                    return;
		////                }

		////                // 3. Select column attributes
		////                // 4. Add new log

		////                logOfWellService.post(ths.id, {
		////                    IdOfWell: ths.id,
		////                    IdOfFileSpec: tmpFileSpec.id,
		////                    Name: ko.unwrap(tmpFileSpec.name),
		////                    Description: selectedArray.join(',')
		////                }).done(function (createdDataOfLogOfWell) {
		////                    // Add to the list
		////                    ths.logsOfWell.push(new LogOfWell(createdDataOfLogOfWell));
		////                });

		////                bootstrapModal.closeModalWindow();
		////            }

		////            tmpModalFileMgr.hide();

		////            bootstrapModal.openModalWindow('Column match', innerDiv, submitFunction);

		//// };

		//} #endregion LOG

		//{ #region HISTORY

		/**
		 * List of history records
		 * @type {Array.<module:models/history-of-well>}
		 */
		this.historyList = ko.observableArray();

		this.isLoadedHistoryList = ko.observable(false);

		this.loadWellHistoryList = function () {
			if (ko.unwrap(ths.isLoadedHistoryList)) {
				return;
			}

			datacontext.getWellHistoryList({
				well_id : ths.Id
			}).done(function (response) {
				ths.historyList(importWellHistoryDto(response, ths));
				ths.isLoadedHistoryList(true);
			});
		};

		this.postHistoryOfWell = function (tmpStartUnixTime, tmpEndUnixTime, scsCallback) {
			datacontext.postWellHistory({
				wellId : ths.id,
				historyText : '',
				startUnixTime : tmpStartUnixTime,
				endUnixTime : tmpEndUnixTime
			}).done(function (result) {
				ths.historyList.push(new HistoryOfWell(result, ths));
				// Clean view values
				scsCallback();
			});
		};

		this.deleteWellHistory = function (itemForDelete) {
			datacontext.deleteWellHistory(itemForDelete.id).done(function () {
				ths.historyList.remove(itemForDelete);
			});
		};

		//} #endregion HISTORY

		//{ #region REPORT

		//// // by default - checked summary tab
		////this.reportSectionIdList = ko.observableArray(['summary']);

		//// this.checkReportSection = function (checkedReportSection) {
		////    switch (checkedReportSection.id) {
		////        case 'map': ths.getWellGroup().getWellField().loadMapsOfWield(); break;
		////        case 'history': ths.loadWellHistoryList(); break;
		////        case 'log':
		////        // Load list of logs
		////        break;
		////        case 'pd': ths.perfomanceOfWell.getHstProductionDataSet(); break;
		////    }
		//// };

		////this.selectedReportMap = ko.observable();
		////this.selectedReportLog = ko.observable();

		////this.isCompanyLogoInReport = ko.observable(false);

		// TODO: make create report
		////ths.createReport = function () {
		////    // checking checkboxes
		////    if (ths.reportSectionIdList().length === 0) {
		////        alert('No selected sections for the report');
		////        return;
		////    }

		////    // existing selected map when map section is checked
		////    if ($.inArray('map', ths.reportSectionIdList()) >= 0) {
		////        if (typeof ths.selectedReportMap() === 'undefined') {
		////            alert('No selected map in the map section');
		////            return;
		////        }
		////    }

		////    if ($.inArray('log', ths.reportSectionIdList()) >= 0) {
		////        if (typeof ths.selectedReportLog() === 'undefined') {
		////            alert('No selected log in the log section');
		////            return;
		////        }
		////    }

		////    if (ths.isCompanyLogoInReport() === true) {
		////        // get user profile
		////        if (!ths.getAppViewModel().curUserProfile().companyLogo()) {
		////            alert('No company logo. Please upload company logo in Cabinet');
		////            return;
		////        }
		////    }

		////    // todo: make check for begin date existence (or end date or together)
		////    //// if ($.inArray('history', ths.reportSectionIdList()) >= 0) {
		////    ////    if (typeof ths.reportHistoryBeginDate === 'undefined') {
		////    ////        alert('No selected maps in the map section');
		////    ////        return;
		////    ////    }
		////    //// }
		////    // get all unknown data for pdf report and creating

		////    var logoUrl = null;
		////    if (ths.isCompanyLogoInReport() === true) {
		////        var companyLogoByte64String = ths.getAppViewModel().curUserProfile().companyLogo();
		////        if (companyLogoByte64String) {
		////            logoUrl = companyLogoByte64String;
		////        }
		////    }

		////    require(['helpers/pdf-helper'], function (pdfHelper) {

		////        pdfHelper.getImageFromUrl(logoUrl, function (logoBase64) {
		////            var sketchUrl = $.inArray('sketch', ths.reportSectionIdList()) >= 0 ? [sketchUrl] : null;
		////            pdfHelper.getImageFromUrl(sketchUrl, function (sketchBase64) {
		////                // coord to nill - load full image (without crop)
		////                var mapUrl = ($.inArray('map', ths.reportSectionIdList()) >= 0) ? (ths.selectedReportMap().fullImgUrl + '&x1=0&y1=0&x2=0&y2=0') : null;
		////                pdfHelper.getImageFromUrl(mapUrl, function (mapBase64) {
		////                    var logUrl = ($.inArray('log', ths.reportSectionIdList()) >= 0) ? (ths.selectedReportLog().Url()) : null;
		////                    pdfHelper.getImageFromUrl(logUrl, function (logBase64) {
		////                        var doc = pdfHelper.createPdf();
		////                        // start string position
		////                        var strPos = 0;
		////                        strPos = pdfHelper.writeFileHeader(doc, strPos, "Well report");
		////                        var nowDateString = appMoment().format("YYYY-MM-DD");
		////                        strPos = pdfHelper.writeHeaderDate(doc, strPos, nowDateString);

		////                        if (logoBase64.length > 0) {
		////                            strPos = pdfHelper.writeLogoImage(doc, strPos, logoBase64[0]);
		////                        }

		////                        strPos = pdfHelper.writeWellName(doc, strPos, ths.Name());

		////                        // other summary fields
		////                        if ($.inArray('summary', ths.reportSectionIdList()) >= 0) {
		////                            strPos = pdfHelper.addSummaryFieldToPdf(doc, ths.ttlDescription, ths.Description(), strPos);
		////                            strPos = pdfHelper.addSummaryFieldToPdf(doc, ths.ttlProductionHistory, ths.ProductionHistory(), strPos);
		////                            strPos = pdfHelper.addSummaryFieldToPdf(doc, ths.ttlCompletionType, ths.CompletionType(), strPos);
		////                            strPos = pdfHelper.addSummaryFieldToPdf(doc, ths.ttlFormationCompleteState, ths.FormationCompleteState(), strPos);
		////                            strPos = pdfHelper.addSummaryFieldToPdf(doc, ths.ttlDrillingDate, ths.DrillingDate() ? appMoment(ths.DrillingDate()).format('YYYY-MM-DD') : '', strPos);
		////                            strPos = pdfHelper.addSummaryFieldToPdf(doc, ths.ttlIntegrityStatus, ths.IntegrityStatus(), strPos);
		////                            strPos = pdfHelper.addSummaryFieldToPdf(doc, ths.ttlLastInterventionType, ths.LastInterventionType(), strPos);
		////                            strPos = pdfHelper.addSummaryFieldToPdf(doc, ths.ttlLastInterventionDate, ths.LastInterventionDate() ? appMoment(ths.LastInterventionDate()).format('YYYY-MM-DD') : '', strPos);
		////                            strPos = pdfHelper.addSummaryFieldToPdf(doc, ths.ttlPerforationDepth, ths.PerforationDepth(), strPos);
		////                            strPos = pdfHelper.addSummaryFieldToPdf(doc, ths.ttlPressureData, ths.PressureData(), strPos);
		////                            strPos = pdfHelper.addSummaryFieldToPdf(doc, ths.ttlPvt, ths.Pvt(), strPos);
		////                            strPos = pdfHelper.addSummaryFieldToPdf(doc, ths.ttlReservoirData, ths.ReservoirData(), strPos);
		////                        }

		////                        // sketch
		////                        if ($.inArray('sketch', ths.reportSectionIdList()) >= 0) {
		////                            // no string position (new page)
		////                            pdfHelper.writeSketchImg(doc, sketchBase64, 'Sketch'); // sketch description


		////                        }

		////                        if (mapBase64.length > 0) {
		////                            pdfHelper.writeMap(doc, mapBase64, 'Map', ths.selectedReportMap().wellMarkers(), ths.selectedReportMap().WellFieldMapAreas());
		////                        }

		////                        if ($.inArray('history', ths.reportSectionIdList()) >= 0) {
		////                            pdfHelper.writeHistory(doc, 'History', ths.sortedHistoryList());
		////                        }

		////                        if (logBase64.length > 0) {
		////                            pdfHelper.writeLog(doc, logBase64, 'Log');
		////                        }

		////                        if ($.inArray('pd', ths.reportSectionIdList()) >= 0) {
		////                            var arrPd = ko.unwrap(ths.perfomanceOfWell.filteredByDateProductionDataSet);
		////                            $.each(ko.unwrap(ths.selectedWfmParamSquadList), function (elemIndex, elemValue) {
		////                                var headerList = $.grep(ko.unwrap(ths.perfomanceOfWell.prdColumnAttributeList), function (pdElem) {
		////                                    return pdElem.Group === elemValue;
		////                                });

		////                                pdfHelper.writePd(doc, elemValue, arrPd, headerList);

		////                                pdfHelper.addHeaderToPdfDoc(doc, 'Perfomance: ' + elemValue + ' graph');
		////                                pdfHelper.drawGraphLabelInPdf(doc, headerList);

		////                                // Graph data is not generated by array
		////                                ////var graphData = getGraphData(arrPd, headerList);
		////                                ////pdfHelper.drawGraphDataInPdf(doc, graphData, headerList);
		////                            });
		////                        }

		////                        pdfHelper.savePdf(doc, 'Report ' + ths.Name() + ' ' + nowDateString);
		////                    });
		////                });
		////            });
		////        });
		////    });
		//// };

		//} #endregion REPORT

		//{ #region NODALANALYSIS

		/**
		 * List of nodal analyzes
		 * @type {Array.<modul:models/nodal-analysis-of-well>}
		 */
		this.listOfNodalAnalysis = ko.observableArray();

		/**
		 * Whether nodal analyzes are loaded
		 * @type {boolean}
		 */
		this.isLoadedListOfNodalAnalysis = ko.observable(false);

		/**
		 * Load nodal analyzes
		 */
		this.loadListOfNodalAnalysis = function () {
			if (ko.unwrap(ths.isLoadedListOfNodalAnalysis)) {
				return;
			}

			nodalAnalysisOfWellService.get(ths.id).done(function (response) {
				ths.listOfNodalAnalysis(importListOfNodalAnalysisOfWell(response));
				ths.isLoadedListOfNodalAnalysis(true);
			});
		};

		/**
		 * Create nodal analysis
		 */
		this.postNodalAnalysis = function (tmpIdOfFileSpec, tmpName, tmpDescription, scsCallback, errCallback) {
			nodalAnalysisOfWellService.post(ths.id, {
				IdOfWell : ths.id,
				IdOfFileSpec : tmpIdOfFileSpec,
				Name : tmpName,
				Description : tmpDescription
			}).done(function (response) {
				ths.listOfNodalAnalysis.push(new NodalAnalysisOfWell(response));
				scsCallback();
			}).fail(errCallback);
		};

		/**
		 * Remove from server
		 */
		this.removeNodalAnalysis = function (tmpMdlToRemove) {
			nodalAnalysisOfWellService.remove(tmpMdlToRemove.idOfWell, tmpMdlToRemove.idOfFileSpec).done(function () {
				ths.listOfNodalAnalysis.remove(tmpMdlToRemove);
			});
		};

		//} #endregion NODALANALYSIS

		//{ #region INTEGRITY

		/**
		 * List of integrity
		 * @type {Array.<modul:models/integrity-of-well>}
		 */
		this.listOfIntegrity = ko.observableArray();

		/**
		 * Whether integrities are loaded
		 * @type {boolean}
		 */
		this.isLoadedListOfIntegrity = ko.observable(false);

		/**
		 * Load integrities
		 */
		this.loadListOfIntegrity = function () {
			if (ko.unwrap(ths.isLoadedListOfIntegrity)) {
				return;
			}

			integrityOfWellService.get(ths.id).done(function (response) {
				ths.listOfIntegrity(importListOfIntegrityOfWell(response));
				ths.isLoadedListOfIntegrity(true);
			});
		};

		/**
		 * Create integrity
		 */
		this.postIntegrity = function (tmpIdOfFileSpec, tmpName, tmpDescription, scsCallback, errCallback) {
			integrityOfWellService.post(ths.id, {
				IdOfWell : ths.id,
				IdOfFileSpec : tmpIdOfFileSpec,
				Name : tmpName,
				Description : tmpDescription
			}).done(function (response) {
				ths.listOfIntegrity.push(new IntegrityOfWell(response));
				scsCallback();
			}).fail(errCallback);
		};

		/**
		 * Remove from server
		 */
		this.removeIntegrity = function (tmpMdlToRemove) {
			integrityOfWellService.remove(tmpMdlToRemove.idOfWell, tmpMdlToRemove.idOfFileSpec).done(function () {
				ths.listOfIntegrity.remove(tmpMdlToRemove);
			});
		};

		//} #endregion INTEGRITY

		//{ #region VOLUME
		/**
		 * Volumes of well
		 * @type {Array.<module:models/volume-of-well>}
		 */
		this.volumes = ko.observableArray();

		/**
		 * Whether volumes are loaded already
		 * @type {boolean}
		 */
		this.isLoadedVolumes = ko.observable(false);

		/** Load volumes */
		this.loadVolumes = function () {
			if (ko.unwrap(ths.isLoadedVolumes)) {
				return;
			}

			volumeOfWellService.get(ths.id).done(function (res) {
				ths.isLoadedVolumes(true);
				ths.volumes(importVolumes(res));
			});
		};

		/** Send volume to the server */
		this.postVolumeOfWell = function (tmpIdOfFileSpec, tmpName, scsCallback, errCallback) {
			volumeOfWellService.post(ths.id, {
				idOfWell : ths.id,
				idOfFileSpec : tmpIdOfFileSpec,
				name : tmpName || '',
				description : ''
			}).done(function (res) {
				// Add to the current array
				ths.volumes.push(new VolumeOfWell(res));
				scsCallback();
			}).fail(errCallback);
		};

		/**
		 * Remove volume from server
		 */
		this.removeVolumeOfWell = function (mdlToRemove) {
			volumeOfWellService.remove(mdlToRemove.idOfWell, mdlToRemove.idOfFileSpec).done(function () {
				ths.volumes.remove(mdlToRemove);
			});
		};

		//} #endregion VOLUME

		//{ #region PERFOMANCE

		this.perfomanceOfWell = new PerfomanceOfWell(ths);

		// Load column attributes - all loading logic in this file (not separated - not in perfomance of well model)
		this.perfomanceOfWell.prdColumnAttributeList(importColumnAttributes(datacontext.getColumnAttributesLocal()));

		//} #endregion PERFOMANCE

		//{ #region MONITORING (for a well group monitoring section and a well monitoring section)

		/**
		 * Procent borders
		 * @type {Array.<module:models/procent-border>}
		 */
		this.procentBorders = ko.observableArray();

		/**
		 * Procent borders as a JSON object
		 *    with empty object for non-exist properties
		 * @type {object}
		 */
		this.objProcentBorders = ko.computed({
				read : function () {
					// List of all params
					var tmpListOfWfmParamOfWroup = ko.unwrap(ths.getWellGroup().listOfWfmParameterOfWroup);

					// List of existing procent borders
					var tmpPbs = ko.unwrap(ths.procentBorders);

					// Result object
					var result = {};

					tmpListOfWfmParamOfWroup.forEach(function (tmpPrm) {
						var tmpProcentBorder = tmpPbs.filter(function (pbItem) {
								return pbItem.idOfWfmParameter === tmpPrm.wfmParameterId;
							})[0];

						if (tmpProcentBorder) {
							result[tmpPrm.wfmParameterId] = tmpProcentBorder;
						} else {
							result[tmpPrm.wfmParameterId] = new ProcentBorder({
									IdOfWell : ths.id,
									IdOfWfmParameter : tmpPrm.wfmParameterId
									// Without procent - null by default
								}, ths);
						}
					});

					return result;
				},
				deferEvaluation : true
			});

		/**
		 * List of monitoring records
		 * @type {Array.<models/monitoring-record>}
		 */
		this.listOfMonitoringRecord = ko.observableArray();

		/**
		 * Sorted records
		 * @type {Array.<models/monitoring-record>}
		 */
		this.sortedListOfMonitoringRecord = ko.computed({
				read : function () {
					return ko.unwrap(ths.listOfMonitoringRecord).sort(function (l, r) {
						return ko.unwrap(l.unixTime) > ko.unwrap(r.unixTime) ? 1 : -1;
					});
				},
				deferEvaluation : true
			});

		/**
		 * Whether data are loaded
		 * @type {boolean}
		 */
		this.isLoadedListOfMonitoringRecord = ko.observable(false);

		/**
		 * Load the filtered list of monitoring records
		 */
		this.loadListOfMonitoringRecord = function (startUnixTime, endUnixTime) {

			// Reload every time: other users can change data in their cabinets
			ths.isLoadedListOfMonitoringRecord(false);
			monitoringRecordService.getFilteredData(ths.id, startUnixTime, endUnixTime).done(function (res) {
				ths.isLoadedListOfMonitoringRecord(true);

				var tmpMntrParams = ko.unwrap(ths.getWellGroup().listOfMonitoredParams);

				ths.importMonitoringRecords(res, tmpMntrParams);
			});
		};

		/**
		 * Import monitoring records
		 */
		this.importMonitoringRecords = function (tmpData, tmpMntrParams) {
			var objArr = tmpData.map(function (tmpItem) {
					// objProcentBorders to make computed properties:
					//         difference between the aveDict and the dict with some procent border
					return new MonitoringRecord(tmpItem, tmpMntrParams, ths.objProcentBorders);
				});

			ths.listOfMonitoringRecord(objArr);
			console.log('monitored parameter records: ', ko.unwrap(ths.listOfMonitoringRecord));
		};

		/**
		 * Post the monitoring record to the server
		 * @param {object} tmpDict - Dictionary of parameters (for new records - empty)
		 */
		this.postMonitoringRecord = function (tmpUnixTime, tmpMntrParams, tmpDict, scsCallback) {
			monitoringRecordService.upsert(ths.id, tmpUnixTime, {
				IdOfWell : ths.id,
				UnixTime : tmpUnixTime,
				Dict : tmpDict
			}).done(function () {
				// Add to the list: not required - this method used only in a group section,
				//       where all data will be reload after posting (to get average values)
				////ths.listOfMonitoringRecord.push(new MonitoringRecord(response, tmpMntrParams, ths.objProcentBorders));
				if (scsCallback) {
					scsCallback();
				}
			});
		};

		/**
		 * Remove all records for this well
		 */
		this.removeAllMonitoringRecords = function () {
			monitoringRecordService.removeAll(ths.id).done(function () {
				// Clean list
				ths.listOfMonitoringRecord([]);
			});
		};

		/**
		 * Import server data to procent borders
		 *    procent borders loaded through the wroup loadProcentBordersForAllWells method
		 */
		this.importProcentBorders = function (tmpProcentBorders) {
			ths.procentBorders(tmpProcentBorders.map(function (pbItem) {
					return new ProcentBorder(pbItem, ths);
				}));

			console.log('Well: ' + ths.id + ': ', ko.unwrap(ths.procentBorders));
		};

		/**
		 * Remove (clear) a procent border
		 */
		this.removeProcentBorder = function (itemToRemove) {
			procentBorderService.remove(itemToRemove.idOfWell, itemToRemove.idOfWfmParameter).done(function () {
				ths.procentBorders.remove(itemToRemove);
			});
		};

		//} #endregion

		/** Load well sections */
		this.listOfSection(importListOfSection(data.ListOfSectionOfWellDto, ths));

		this.toDto = function () {
			var dtoObj = {
				'Id' : ths.Id,
				'WellGroupId' : ths.WellGroupId,
				'WellType' : ko.unwrap(ths.WellType),
				'FlowType' : ko.unwrap(ths.FlowType),
				'Comment' : ko.unwrap(ths.Comment)
			};

			ths.propSpecList.forEach(function (prop) {
				dtoObj[prop.serverId] = ko.unwrap(ths[prop.clientId]);
			});

			return dtoObj;
		};
	};

	return exports;
});
