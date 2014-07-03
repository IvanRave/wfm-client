/** @module */
define(['jquery',
		'knockout',
		'services/datacontext',
		'helpers/app-helper',
		'models/file-spec-of-history-of-well',
		'services/file-spec-of-history-of-well',
		'models/wfm-image',
		'services/image-of-history-of-well'],
	function ($, ko, datacontext, appHelper,
		FileSpecOfHistoryOfWell, fileSpecOfHistoryOfWellService,
		WfmImage, imageOfHistoryOfWellService) {
	'use strict';

	// convert data objects into array
	function importWellHistoryFiles(data) {
		return (data || []).map(function (item) {
			return new FileSpecOfHistoryOfWell(item);
		});
	}

	function importWfmImagesDto(data) {
		return (data || []).map(function (item) {
			return new WfmImage(item);
		});
	}

	/**
	 * History of well
	 * @constructor
	 */
	var exports = function (data, well) {
		data = data || {};

		this.getWell = function () {
			return well;
		};

		// Properties
		this.id = data.Id;
		this.historyText = ko.observable(data.HistoryText);
		this.startUnixTime = ko.observable(data.StartUnixTime);
		this.endUnixTime = ko.observable(data.EndUnixTime);
		this.jobTypeId = data.JobTypeId ? ko.observable(data.JobTypeId) : ko.observable();
		this.wellId = data.WellId;

		this.WfmImages = ko.observableArray();

		/**
		 * A list of history files
		 * @type {Array.<module:models/file-spec>}
		 */
		this.WellHistoryFiles = ko.observableArray(importWellHistoryFiles(data.WellHistoryFiles));

		/**
		 * A list of job types of this company
		 * @type {module:models/job-type}
		 */
		this.listOfJobTypeOfCompany = ko.computed({
				read : this.calcListOfJobTypeOfCompany,
				deferEvaluation : true,
				owner : this
			});

		// Load job type id
		// Extract from root.companyJobTypeList by id
		// Computed
		this.jobType = ko.computed({
				read : this.calcJobTypeById,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Whether the end time block is visible
		 * @type {boolean}
		 */
		this.isVisibleEndUnixTime = ko.computed({
				read : this.calcIsVisEndUnixTime,
				deferEvaluation : true,
				owner : this
			});

		this.startUnixTime.subscribe(this.putWellHistory, this);
		this.endUnixTime.subscribe(this.putWellHistory, this);
		this.jobTypeId.subscribe(this.putWellHistory, this);

		if (data.WfmImagesDto) {
			this.WfmImages(importWfmImagesDto(data.WfmImagesDto));
		}

		// No needs. Extracted from root.jobTypeList
		////if (data.JobTypeDto) {
		////    ths.jobType(new JobType(data.JobTypeDto));
		////}
	};

	/**
	 * Calc a list with job types
	 * @private
	 * @returns {Array.<module:models/job-type>}
	 */
	exports.prototype.calcListOfJobTypeOfCompany = function () {
		return ko.unwrap(this.getWell().getWellGroup().getWellField().getWellRegion().getCompany().jobTypeList);
	};

	/**
	 * Calc a job type using id
	 * @return {module:models/job-type
	 */
	exports.prototype.calcJobTypeById = function () {
		var tmpJobTypeId = ko.unwrap(this.jobTypeId);
		if (tmpJobTypeId) {
			var companyJobTypeList = ko.unwrap(this.listOfJobTypeOfCompany);
			return appHelper.getElementByPropertyValue(companyJobTypeList, 'id', tmpJobTypeId);
		}
	};

	/**
	 * Calc visibility of the end time block
	 * @return {boolean}
	 */
	exports.prototype.calcIsVisEndUnixTime = function () {
		return ko.unwrap(this.startUnixTime) !== ko.unwrap(this.endUnixTime);
	};

	/**
	 * Save a history
	 */
	exports.prototype.putWellHistory = function () {
		datacontext.putWellHistory({
			id : ko.unwrap(this.id),
			startUnixTime : ko.unwrap(this.startUnixTime),
			endUnixTime : ko.unwrap(this.endUnixTime),
			wellId : ko.unwrap(this.wellId),
			historyText : ko.unwrap(this.historyText),
			jobTypeId : ko.unwrap(this.jobTypeId)
		});
	};

	/**
	 * Remove an image from history
	 */
	exports.prototype.removeWfmImage = function (itemForDelete) {
		if (confirm('Are you sure you want to delete?')) {
			var ths = this;
			imageOfHistoryOfWellService.remove(this.id, itemForDelete.id).done(function () {
				ths.WfmImages.remove(itemForDelete);
			});
		}
	};

	/** Remove file spec of history of well */
	exports.prototype.removeFileSpecOfHistoryOfWell = function (fileSpecOfHistoryOfWellToRemove) {
		if (confirm('Are you sure you want to delete this file?')) {
			var ths = this;
			fileSpecOfHistoryOfWellService.remove(ths.id, fileSpecOfHistoryOfWellToRemove.idOfFileSpec).done(function () {
				ths.WellHistoryFiles.remove(fileSpecOfHistoryOfWellToRemove);
			});
		}
	};

	/**
	 * Create file spec of history of well from well section
	 */
	exports.prototype.postFileSpecOfHistoryOfWell = function (tmpIdOfFileSpec, scsCallback, errCallback) {
		var ths = this;
		fileSpecOfHistoryOfWellService.post(ths.id, {
			idOfFileSpec : tmpIdOfFileSpec,
			idOfHistoryOfWell : ths.id,
			description : ''
		}).done(function (res) {
			ths.WellHistoryFiles.push(new FileSpecOfHistoryOfWell(res));
			// Hide window
			scsCallback();
		}).fail(errCallback);
	};

	/**
	 * Create cropped well history image from file spec
	 */
	exports.prototype.postImageOfHistoryOfWell = function (tmpIdOfFileSpec, coords, scsCallback) {
    var ths = this;
		imageOfHistoryOfWellService.post(ths.id, {
			IdOfFileSpec : tmpIdOfFileSpec,
			X1 : coords[0],
			X2 : coords[2],
			Y1 : coords[1],
			Y2 : coords[3],
			CropXUnits : 0,
			CropYUnits : 0
		}).done(function (res) {
			ths.WfmImages.push(new WfmImage(res));
			scsCallback();
		});
	};

	return exports;
});
