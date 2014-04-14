/** @module */
define(['knockout',
		'viewmodels/widgock',
		'helpers/lang-helper'],
	function (ko,
		VwmWidgock,
		langHelper) {

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
	 * Generate a report, using this layout
	 */
	exports.prototype.generateReport = function () {
		// Open some window to enter a name of the report and some settings
		// By default - name of the layout - name of the report + current date

		// Send a request to the wfm-node to create a report
		this.isReportInProgress(true);
		this.mdlWidgout.postReport(this.scsGenerateReport.bind(this),
			this.errGenerateReport.bind(this));
	};

	/**
	 * A success callback for report generation
	 */
	exports.prototype.scsGenerateReport = function () {
		// Stop a loading
		this.isReportInProgress(false);
	};

	/**
	 * Callback for error
	 */
	exports.prototype.errGenerateReport = function (jqXhr) {
		this.isReportInProgress(false);
		console.log(jqXhr);
		if (jqXhr.status === 422) {
			var resJson = jqXhr.responseJSON;
			var tmpProcessError = (langHelper.translate(resJson.errId) || resJson.errId);
			alert(tmpProcessError);
		}
	};

	return exports;
});
