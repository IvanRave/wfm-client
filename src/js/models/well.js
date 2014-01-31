/** @module */
define([
    'jquery',
    'knockout',
    'services/datacontext',
    'helpers/file-helper',
    'helpers/modal-helper',
    'helpers/app-helper',
    'moment',
    'models/bases/stage-base',
    'models/stage-partials/well-perfomance-partial',
    'models/section-of-stage',
    'models/well-file',
    'models/sketch-of-well',
    'models/prop-spec',
    'services/well',
    'constants/stage-constants',
    'models/volume-of-well',
    'services/volume-of-well',
    'models/history-of-well',
    'models/log-of-well',
    'services/log-of-well',
    'services/file-spec',
    'models/column-attribute',
    'models/test-scope',
], function ($, ko, datacontext, fileHelper, bootstrapModal,
    appHelper, appMoment, StageBase, wellPerfomancePartial,
    SectionOfWell, WellFile, SketchOfWell,
    PropSpec, wellService,
    stageConstants, VolumeOfWell,
    volumeOfWellService, HistoryOfWell,
    LogOfWell, logOfWellService,
    fileSpecService, ColumnAttribute) {
    'use strict';

    function importVolumes(data) {
        return (data || []).map(function (item) { return new VolumeOfWell(item); });
    }

    function importLogsOfWell(data) {
        return (data || []).map(function (item) { return new LogOfWell(item); });
    }

    /** WellFiles (convert data objects into array) */
    function importWellFilesDto(data, parent) { return data.map(function (item) { return new WellFile(item, parent); }); }

    /** ColumnAttributes (convert data objects into array) */
    function importColumnAttributes(data) { return data.map(function (item) { return new ColumnAttribute(item); }); }

    /** WellHistory (convert data objects into array) */
    function importWellHistoryDto(data, parent) { return data.map(function (item) { return new HistoryOfWell(item, parent); }); }

    /** Test scope */
    function importTestScopeDtoList(data, wellItem) { return data.map(function (item) { return datacontext.createTestScope(item, wellItem); }); }

    /** Import all sections of well */
    function importSectionList(data, wellItem) {
        return data.map(function (item) { return new SectionOfWell(item, wellItem); });
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
        new PropSpec('Name', 'Name', 'Well name', 'SingleLine', { maxLength: 255 }),
        new PropSpec('Description', 'Description', 'Description', 'MultiLine', {}),
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
        * Well files
        * @type {Array.<WellFile>}
        */
        this.WellFiles = ko.observableArray();

        /** 
        * Field maps for this well
        * @type {Array.<WellFieldMap>}
        */
        this.wellMapList = ko.computed({
            read: function () {
                return getWellMapList(ko.unwrap(this.getWellGroup().getWellField().WellFieldMaps), this.Id);
            },
            deferEvaluation: true,
            owner: this
        });

        /**
        * Load content of the section
        * @param {object} section - Section
        */
        this.loadSectionContent = function (idOfSectionPattern) {
            switch (idOfSectionPattern) {
                // Dashboard: from undefined to null
                case 'well-history': {
                    ths.loadWellHistoryList();
                    break;
                }
                case 'well-sketch': {
                    ths.sketchOfWell.load();
                    break;
                }
                case 'well-volume': {
                    ths.loadVolumes();
                    break;
                }
                case 'well-perfomance': {
                    ths.getWellGroup().getWellGroupWfmParameterList();
                    ths.perfomancePartial.forecastEvolution.getDict();
                    ths.perfomancePartial.getHstProductionDataSet();
                    break;
                }
                case 'well-nodalanalysis': {
                    ths.isLoadedNodal(false);

                    ths.getWellFileList(function () {
                        var mainWellFile = null;
                        if (ths.WellFiles().length > 0) {
                            mainWellFile = ths.WellFiles()[0];
                        }

                        ths.selectedWellFileNodal(mainWellFile);
                        ths.isLoadedNodal(true);
                    }, 'nodalanalysis', 'work');

                    break;
                }
                case 'well-integrity': {
                    ths.isLoadedIntegrity(false);

                    ths.getWellFileList(function () {
                        var mainWellFile = null;
                        if (ths.WellFiles().length > 0) {
                            mainWellFile = ths.WellFiles()[0];
                        }

                        ths.selectedWellFileIntegrity(mainWellFile);
                        ths.isLoadedIntegrity(true);
                    }, 'integrity', 'work');

                    break;
                }
                case 'well-log': {
                    ths.loadLogsOfWell();
                    // TODO: Select first log image
                    break;
                }
                case 'well-test': {
                    ths.getTestScopeList();
                    ths.getWellGroup().getWellGroupWfmParameterList();
                    break;
                }
                case 'well-map': {
                    // find wellfield_id 
                    var wellFieldItem = ths.getWellGroup().getWellField();

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

        this.loadDashboard = function () {
            ths.sketchOfWell.load();
            // TODO: load data only if there is one or more perfomance widgets (only once) for entire well
            ths.getWellGroup().getWellGroupWfmParameterList();
            ths.perfomancePartial.forecastEvolution.getDict();
            ths.perfomancePartial.getHstProductionDataSet();
            ths.loadWellHistoryList();
        };

        /** Save this well main properties */
        this.save = function () {
            wellService.put(ths.Id, ths.toDto());
        };

        /** Every section has files: filter files only for current section */
        // TODO: Change to new realization
        this.sectionWellFiles = ko.computed({
            read: function () {
                ////if (ko.unwrap(ths.selectedSection)) {
                ////    return $.grep(ko.unwrap(ths.WellFiles), function (wellFile) {
                ////        return ko.unwrap(wellFile.Purpose) === ko.unwrap(ths.selectedSectionId);
                ////    });
                ////}
            },
            deferEvaluation: true
        });

        this.isExistsSectionWellFiles = ko.computed({
            read: function () {
                if (ko.unwrap(ths.sectionWellFiles)) {
                    return ko.unwrap(ths.sectionWellFiles).length > 0;
                }
            },
            deferEvaluation: true
        });

        // ======================= file manager section ======================
        // file manager section: like above section but in file manager view
        this.selectedFmgSectionId = ko.observable(null);

        this.selectFmgSection = function (item) {
            ths.selectedFmgSectionId(item.id);
        };

        this.filteredWellFileList = ko.computed(function () {
            if (!ths.selectedFmgSectionId()) {
                return ths.WellFiles();
            }

            return $.grep(ths.WellFiles(), function (elemValue) {
                return elemValue.Purpose === ths.selectedFmgSectionId();
            });
        });

        this.getWellFileList = function (callback, purpose, status) {
            var uqp = { well_id: ths.Id };

            if (purpose) {
                uqp.purpose = purpose;
            }

            if (status) {
                uqp.status = status;
            }

            datacontext.getWellFiles(uqp).done(function (response) {
                ths.WellFiles(importWellFilesDto(response, ths));
                if ($.isFunction(callback) === true) {
                    callback();
                }
            });
        };

        // ==================================================================Well test begin================================================================

        this.testScopeList = ko.observableArray();

        this.sortedTestScopeList = ko.computed(function () {
            return ths.testScopeList().sort(function (left, right) {
                return left.startUnixTime() === right.startUnixTime() ? 0 : (left.startUnixTime() < right.startUnixTime() ? 1 : -1);
            });
        });

        this.lastTestScope = ko.observable();

        this.getTestScopeList = function () {
            datacontext.getTestScope({ well_id: ths.Id }).done(function (response) {
                ths.testScopeList(importTestScopeDtoList(response, ths));
            });
        };

        /** Unix time data for creating new test scope */
        this.testScopeNewStartUnixTime = {
            unixDate: ko.observable(),
            hour: ko.observable(0),
            minute: ko.observable(0)
        };

        this.isEnabledPostTestScope = ko.computed({
            read: function () {
                if (ko.unwrap(ths.testScopeNewStartUnixTime.unixDate)) {
                    if (ko.unwrap(ths.testScopeNewStartUnixTime.hour) >= 0) {
                        if (ko.unwrap(ths.testScopeNewStartUnixTime.minute) >= 0) {
                            return true;
                        }
                    }
                }

                return false;
            },
            deferEvaluation: true
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

                datacontext.saveNewTestScope({
                    WellId: ths.Id,
                    StartUnixTime: unixTime,
                    IsApproved: null,
                    ConductedBy: '',
                    CertifiedBy: ''
                }).done(function (response) {
                    ths.testScopeList.unshift(datacontext.createTestScope(response, ths));
                });
            }
        };

        this.selectedTestScope = ko.observable();

        this.chooseTestScope = function (testScopeItem) {
            if (testScopeItem === ths.selectedTestScope()) {
                ths.selectedTestScope(null);
            }
            else {
                ths.selectedTestScope(testScopeItem);
            }
        };

        // ==================================================================Well test end================================================================

        this.wellMarkers = ko.observableArray();

        // ================================================= Well log start =================================================

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
            if (ko.unwrap(ths.isLoadedLogsOfWell)) { return; }

            logOfWellService.get(ths.id).done(function (res) {
                ths.logsOfWell(importLogsOfWell(res));
                ths.isLoadedLogsOfWell(true);
            });
        };

        /**
        * Get columns for log file
        */
        this.getLogColumnAttributes = function(idOfNeedSection, idOfFileSpec, scsCallback){
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
                IdOfWell: ths.id,
                IdOfFileSpec: tmpIdOfFileSpec,
                Name: tmpName,
                Description: selectedArray.join(',')
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
             
        ////};

        // ================================================= Well history section start =======================================

        /**
        * List of history records
        * @type {Array.<module:models/history-of-well>}
        */
        this.historyList = ko.observableArray();

        this.isLoadedHistoryList = ko.observable(false);

        this.loadWellHistoryList = function () {
            if (ko.unwrap(ths.isLoadedHistoryList)) { return; }

            datacontext.getWellHistoryList({ well_id: ths.Id }).done(function (response) {
                ths.historyList(importWellHistoryDto(response, ths));
                ths.isLoadedHistoryList(true);
            });
        };

        this.postHistoryOfWell = function (tmpStartUnixTime, tmpEndUnixTime, scsCallback) {
            datacontext.postWellHistory({
                wellId: ths.id,
                historyText: '',
                startUnixTime: tmpStartUnixTime,
                endUnixTime: tmpEndUnixTime
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

        // ============================================================= Well history end ===============================================

        this.sectionList = datacontext.getSectionList();

        // =============================================================Well report begin=========================================================

        //// // by default - checked summary tab
        ////this.reportSectionIdList = ko.observableArray(['summary']);

        ////this.checkReportSection = function (checkedReportSection) {
        ////    switch (checkedReportSection.id) {
        ////        case 'map': ths.getWellGroup().getWellField().loadMapsOfWield(); break;
        ////        case 'history': ths.loadWellHistoryList(); break;
        ////        case 'log': ths.getWellFileList('log', 'work'); break;
        ////        case 'pd': ths.perfomancePartial.getHstProductionDataSet(); break;
        ////    }
        ////};

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
        ////    ////if ($.inArray('history', ths.reportSectionIdList()) >= 0) {
        ////    ////    if (typeof ths.reportHistoryBeginDate === 'undefined') {
        ////    ////        alert('No selected maps in the map section');
        ////    ////        return;
        ////    ////    }
        ////    ////}
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
        ////            var sketchUrl = $.inArray('sketch', ths.reportSectionIdList()) >= 0 ? ths.MainSketchUrl() : null;
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
        ////                            var arrPd = ko.unwrap(ths.perfomancePartial.filteredByDateProductionDataSet);
        ////                            $.each(ko.unwrap(ths.selectedWfmParamSquadList), function (elemIndex, elemValue) {
        ////                                var headerList = $.grep(ko.unwrap(ths.perfomancePartial.prdColumnAttributeList), function (pdElem) {
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
        ////};

        // =============================================================Well report end=================================================

        // nodal files ======================================
        this.selectedWellFileNodal = ko.observable();

        this.selectWellFileNodal = function (wellFile) {
            ths.selectedWellFileNodal(wellFile);
        };

        this.isLoadedNodal = ko.observable(false);

        // integrity files =======================================
        this.selectedWellFileIntegrity = ko.observable();

        this.selectWellFileIntegrity = function (wellFile) {
            ths.selectedWellFileIntegrity(wellFile);
        };

        this.isLoadedIntegrity = ko.observable(false);

        // file manager
        // function(selectedItemFromKnockout, ...)
        this.showFmg = function (callbackFunction) {
            var jqrModalFileManager = $('#modal-file-manager');

            $.each(ths.sectionList, function (elemIndex, elemValue) {
                if (elemValue.formatList.length > 0) {
                    var elemFileUpload = jqrModalFileManager.find('#' + elemValue.id + '_file_upload').get(0);

                    fileHelper.initFileUpload(elemFileUpload, datacontext.getWellFileUrl({
                        well_id: ths.Id,
                        purpose: elemValue.id,
                        status: 'work'
                    }), elemValue.formatList, function () {
                        ths.getWellFileList();
                    });
                }
            });

            ths.getWellFileList();

            function hideModal() {
                jqrModalFileManager.modal('hide');
            }

            function submitFunction() {
                // get checked (selected) files
                var checkedWellFiles = $.map(ko.unwrap(ths.WellFiles), function (elemValue) {
                    if (ko.unwrap(elemValue.isChecked) === true) {
                        return elemValue;
                    }
                });

                if (typeof (callbackFunction) !== 'undefined' && $.isFunction(callbackFunction)) {
                    callbackFunction(checkedWellFiles);
                }
                else {
                    hideModal();
                }
            }

            jqrModalFileManager.find('.modal-ok').off('click').on('click', submitFunction);
            jqrModalFileManager.find('.modal-close').off('click').on('click', hideModal);

            jqrModalFileManager.modal('show');

            ////var innerDiv = document.createElement('div');

            ////$(innerDiv).load(datacontext.getFileManagerUrl(), function () {
            ////    ko.applyBindings(ths, $(innerDiv).get(0));

            ////    $.each(ths.sectionList, function (elemIndex, elemValue) {
            ////        if (elemValue.formatList.length > 0) {
            ////            var elemFileUpload = $(innerDiv).find('#' + elemValue.id + '_file_upload').get(0);

            ////            fileHelper.initFileUpload(elemFileUpload, datacontext.getWellFileUrl({
            ////                well_id: ths.Id,
            ////                purpose: elemValue.id,
            ////                status: 'work'
            ////            }), elemValue.formatList, function () {
            ////                ths.getWellFileList();
            ////            });
            ////        }
            ////    });

            ////    ths.getWellFileList();
            ////    var submitFunction = function () {
            ////        // get checked (selected) files
            ////        var checkedWellFiles = $.map(ths.WellFiles(), function (elemValue) {
            ////            if (elemValue.isChecked() === true) {
            ////                return elemValue;
            ////            }
            ////        });

            ////        if (typeof (callbackFunction) !== 'undefined' && $.isFunction(callbackFunction)) {
            ////            callbackFunction(checkedWellFiles);
            ////        }
            ////        else {
            ////            bootstrapModal.closeModalWideWindow();
            ////        }
            ////    };

            ////    bootstrapModal.openModalWideWindow(innerDiv, submitFunction);
            ////});
        };

        /** Sketch of well: by default - empty */
        this.sketchOfWell = new SketchOfWell(ths);

        this.sketchHashString = ko.observable(new Date().getTime());

        this.putWell = function () {
            wellService.put(ths.Id, ths.toDto());
        };

        this.chooseMainFile = function (purpose) {
            ths.selectedFmgSectionId(purpose);
            var callbackFunction = function (checkedWellFileList) {
                if (checkedWellFileList.length !== 1) {
                    alert('Need to select one image');
                    return;
                }

                var checkedFile = checkedWellFileList[0];
                if ($.inArray(checkedFile.ContentType, datacontext.imageMimeTypes) === -1) {
                    alert('Need to select image file: ' + datacontext.imageMimeTypes.join(', '));
                    return;
                }

                bootstrapModal.closeModalFileManager();

                var urlQueryParams = {
                    well_id: ths.Id,
                    purpose: checkedFile.Purpose,
                    status: checkedFile.Status(),
                    file_name: checkedFile.Name(),
                    dest_well_id: ths.Id,
                    dest_purpose: checkedFile.Purpose,
                    dest_status: checkedFile.Status(),
                    dest_file_name: 'main.' + purpose
                };

                datacontext.getWellFiles(urlQueryParams).done(function () {
                    ths[purpose + 'HashString'](new Date().getTime());
                });
            };

            ths.showFmg(callbackFunction);
        };

        this.editField = function (wellProp) {
            ////console.log(wellProp);
            var fieldName = wellProp.id,
                fieldTitle = wellProp.ttl,
                inputType = wellProp.tpe;

            ////fieldName, inputType
            // draw window with this field
            var inputField;

            var tmpFieldValue = ko.unwrap(ths[fieldName]);

            if (inputType === 'SingleLine') {
                inputField = document.createElement('input');
                inputField.type = 'text';
                $(inputField).prop({
                    'placeholder': fieldTitle
                }).val(tmpFieldValue).addClass('form-control');
            }
            else if (inputType === 'MultiLine') {
                inputField = document.createElement('textarea');
                $(inputField).prop({ "rows": 5, 'placeholder': fieldTitle }).val(tmpFieldValue).addClass('form-control');
            }

            var innerDiv = document.createElement('div');
            $(innerDiv).addClass('form-horizontal').append(
                bootstrapModal.gnrtDom(fieldTitle, inputField)
            );

            function submitFunction() {
                ths[fieldName]($(inputField).val());
                ths.putWell();
                bootstrapModal.closeModalWindow();
            }

            bootstrapModal.openModalWindow('{{capitalizeFirst lang.toEdit}}', innerDiv, submitFunction);
        };

        this.MainSketchUrl = ko.computed({
            read: function () {
                return datacontext.getWellFileUrl({
                    well_id: ths.Id,
                    purpose: 'sketch',
                    status: 'work',
                    file_name: 'main.sketch'
                }) + '&hashstring=' + ths.sketchHashString();
            },
            deferEvaluation: true
        });

        // =========================================== Volume of well ====================================
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
            if (ko.unwrap(ths.isLoadedVolumes)) { return; }

            volumeOfWellService.get(ths.id).done(function (res) {
                ths.isLoadedVolumes(true);
                ths.volumes(importVolumes(res));
            });
        };

        /** Send volume to the server */
        this.postVolumeOfWell = function (tmpIdOfFileSpec, tmpName, scsCallback, errCallback) {
            volumeOfWellService.post(ths.id, {
                idOfWell: ths.id,
                idOfFileSpec: tmpIdOfFileSpec,
                name: tmpName || '',
                description: ''
            }).done(function (res) {
                // Add to the current array
                ths.volumes.push(new VolumeOfWell(res));
                scsCallback();
            }).fail(errCallback);
        };

        //================================================= Edit well ======================================

        this.editWell = function () {
            var inputName = document.createElement('input');
            inputName.type = 'text';
            $(inputName).val(ths.Name()).prop({ 'required': true });

            var inputDescription = document.createElement('input');
            inputDescription.type = 'text';
            $(inputDescription).val(ths.Description());

            var inputProductionHistory = document.createElement('textarea');
            $(inputProductionHistory).val(ths.ProductionHistory()).prop("rows", 5);

            var innerDiv = document.createElement('div');
            $(innerDiv).addClass('form-horizontal').append(
                bootstrapModal.gnrtDom('Name', inputName),
                bootstrapModal.gnrtDom('Description', inputDescription),
                bootstrapModal.gnrtDom('Production history', inputProductionHistory)
            );

            function submitFunction() {
                ths.Name($(inputName).val());
                ths.Description($(inputDescription).val());
                ths.ProductionHistory($(inputProductionHistory).val());
                ths.save();
                bootstrapModal.closeModalWindow();
            }

            bootstrapModal.openModalWindow("Well", innerDiv, submitFunction);
        };

        this.deleteWellFile = function () {
            var wellFileForDelete = this;
            if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + wellFileForDelete.Name() + '"?')) {
                datacontext.deleteWellFile(wellFileForDelete).done(function () {
                    ths.WellFiles.remove(wellFileForDelete);
                });
            }
        };

        // without archive
        ////ths.invertWellFileStatus = function () {
        ////    var invertWellFile = this;
        ////    var urlQueryParams = {
        ////        well_id: ths.Id,
        ////        purpose: invertWellFile.Purpose,
        ////        status: invertWellFile.Status(),
        ////        file_name: invertWellFile.Name(),
        ////        need_action: 'invertstatus' // deprecated
        ////    };

        ////    datacontext.getWellFiles(urlQueryParams).done(function () {
        ////        ////if (invertWellFile.Purpose === 'sketch') {
        ////        ////    alert('File: "' + invertWellFile.Name() + '" successfully set as the main well sketch');
        ////        ////}
        ////        ////else
        ////        if (invertWellFile.Purpose === 'pd') {
        ////            // delete old file
        ////            datacontext.deleteWellFile(invertWellFile).done(function () {
        ////                // update list
        ////                ths.getWellFileList();
        ////            });
        ////        }
        ////    });
        ////};

        // ==================================================================== Well perfomance begin ========================================

        this.perfomancePartial = wellPerfomancePartial.init(ths);

        // Load column attributes - all loading logic in this file (not separated - not in well-perfomance-partial file)
        this.perfomancePartial.prdColumnAttributeList(importColumnAttributes(datacontext.getColumnAttributesLocal()));

        this.mainPerfomanceView = ths.perfomancePartial.createPerfomanceView({
            isVisibleForecastData: false
        });

        /** Load well sections */
        this.listOfSection(importSectionList(data.ListOfSectionOfWellDto, ths));

        // ==================================================================== Well perfomance section end ========================================

        this.toDto = function () {
            var dtoObj = {
                'Id': ths.Id,
                'WellGroupId': ths.WellGroupId,
                'WellType': ko.unwrap(ths.WellType),
                'FlowType': ko.unwrap(ths.FlowType),
                'Comment': ko.unwrap(ths.Comment)
            };

            ths.propSpecList.forEach(function (prop) {
                dtoObj[prop.serverId] = ko.unwrap(ths[prop.clientId]);
            });

            return dtoObj;
        };
    };

    return exports;
});