﻿/** @module */
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
    'viewmodels/perfomance-of-well'],
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
    VwmPerfomanceOfWell) {
	'use strict';

	/**
	 * Well view model
	 * @constructor
	 */
	var exports = function (mdlWell, parentVwmWroup, defaultSlcData) {
		var ths = this;

		this.mdlStage = mdlWell;

		this.unq = mdlWell.id;

		this.fmgr = parentVwmWroup.fmgr;

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
    this.removeVwmVolumeOfWell = function(vwmToRemove){
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
	};

	return exports;
});