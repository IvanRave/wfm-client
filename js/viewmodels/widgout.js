/** @module */
define(['jquery',
		'knockout',
		'moment',
		'viewmodels/widgock',
		'helpers/lang-helper',
		'helpers/modal-helper'],
	function ($,
		ko,
		appMoment,
		VwmWidgock,
		langHelper,
		modalHelper) {

	'use strict';

	/**
	 * Viewmodel: widget layout (show widget layout model)
	 * @constructor
	 */
	var exports = function (mdlWidgout, parentVwmStage) {
		/**
		 * Model widget layout
		 * @type {module:models/widgout}
		 */
		this.mdlWidgout = mdlWidgout;

		this.getParentVwmStage = function () {
			return parentVwmStage;
		};

		/**
		 * Widget layout name for view
		 * @type {string}
		 */
		this.name = mdlWidgout.name;

		/**
		 * List of views of widget blocks
		 * @type {Array.<module:viewmodels/widgock>}
		 */
		this.listOfVwmWidgock = ko.computed({
				read : this.buildListOfVwmWidgock,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Whether report is in loading progress
		 * @type {bool}
		 */
		this.isReportInProgress = ko.observable(false);

		/**
		 * Guid of a created report
		 *    After generating report - set it - to download or view
		 * @type {string}
		 */
		this.idOfReportFileSpec = ko.observable(null);

		/**
		 * The created report file
		 *    to download or view
		 * @type {module:models/file-spec}
		 */
		this.reportFileSpec = ko.computed({
				read : this.calcReportFileSpec,
				deferEvaluation : true,
				owner : this
			});
	};

	/**
	 * Build viewmodels
	 */
	exports.prototype.buildListOfVwmWidgock = function () {
		return ko.unwrap(this.mdlWidgout.widgocks).map(function (elem) {
			return new VwmWidgock(elem, this);
		}, this);
	};

	/**
	 * Modal window for input data for a new report
	 */
	exports.prototype.preGenerateReport = function () {
		var curDate = appMoment().format('YYYY-MM-DD');
		var inputName = document.createElement('input');
		inputName.type = 'text';
		var jqrInput = $(inputName);
		jqrInput.prop({
			'required' : true
		}).addClass('form-control').val(ko.unwrap(this.name) + ' ' + curDate);

		var innerDiv = document.createElement('div');
		$(innerDiv).addClass('form-horizontal').append(
			modalHelper.gnrtDom('Name', inputName));

		modalHelper.openModalWindow('Report',
			innerDiv,
			this.generateReport.bind(this, jqrInput));
	};

	/**
	 * Generate a report, using this layout
	 */
	exports.prototype.generateReport = function (jqrInput) {
		var nameOfReport = jqrInput.val();
		modalHelper.closeModalWindow();
		//console.log('nameOfReport', nameOfReport);
		// Open some window to enter a name of the report and some settings
		// By default - name of the layout - name of the report + current date

		// Send a request to the wfm-node to create a report
		this.isReportInProgress(true);
		this.mdlWidgout.postReport(nameOfReport, this.scsGenerateReport.bind(this),
			this.errGenerateReport.bind(this));
	};

	/**
	 * A success callback for report generation
	 */
	exports.prototype.scsGenerateReport = function (res) {
		this.idOfReportFileSpec(res.idOfFileSpec);

		var tmpReportSection = ko.unwrap(this.getParentVwmStage().mdlStage.reportSection);

		if (tmpReportSection) {
			tmpReportSection.isLoadedListOfFileSpec(false);
			tmpReportSection.loadListOfFileSpec(false);
		}
    
		// console.log('created file', res.IdOfFileSpec);
		// Stop a loading
		this.isReportInProgress(false);

		// Update a report section
		// Get report-stage
		// Set to false - isLoadedListOfFileSpec
		// loadListOfFileSpec
		// // var innerDiv = document.createElement('div');

		// // $(innerDiv).append('<div class="text-center">The report has been saved in the Report folder</div>');
		// // $(innerDiv).append('<div class="text-center"><span class="link-view">Download the report</span></div>');

		// // modalHelper.openModalWindow('The report has been generated',
		// // innerDiv,
		// // modalHelper.closeModalWindow);
	};

	/**
	 * Callback for error
	 */
	exports.prototype.errGenerateReport = function (jqXhr) {
		this.isReportInProgress(false);
		console.log(jqXhr);
		if (jqXhr.status === 422) {
			var resJson = jqXhr.responseJSON;
			var tmpProcessError = (langHelper.translate(resJson.message) || resJson.message);
			alert(tmpProcessError);
		}
	};

	/**
	 * Calulate a report file specification
	 */
	exports.prototype.calcReportFileSpec = function () {
    console.log('calcReportFileSpec');
		var tmpId = ko.unwrap(this.idOfReportFileSpec);
		if (!tmpId) {
			return;
		}

		var tmpReportSection = ko.unwrap(this.getParentVwmStage().mdlStage.reportSection);

		if (tmpReportSection) {
			return ko.unwrap(tmpReportSection.listOfFileSpec).filter(function (tmpFileSpec) {
				return tmpFileSpec.id === tmpId;
			})[0];
		}

		// Get report section of a parent stage
		// Find a filespec with this id from this section
	};

  /**
  * Download a created report with cleanning from view
  */
  exports.prototype.downloadWithClean = function(){
    var tmpReportFileSpec = ko.unwrap(this.reportFileSpec);
    
    if (tmpReportFileSpec){
      tmpReportFileSpec.download();
    }
    
    this.idOfReportFileSpec(null);
  };
  
	return exports;
});
