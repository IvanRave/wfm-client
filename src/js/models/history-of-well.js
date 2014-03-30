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
		var ths = this;
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

		// Load job type id
		// Extract from root.companyJobTypeList by id
		// Computed
		this.jobType = ko.computed({
				read : function () {
					var tmpJobTypeId = ko.unwrap(ths.jobTypeId);
					if (tmpJobTypeId) {
						var companyJobTypeList = ko.unwrap(ths.getWell().getWellGroup().getWellField().getWellRegion().getCompany().jobTypeList);
						return appHelper.getElementByPropertyValue(companyJobTypeList, 'id', tmpJobTypeId);
					}
				},
				deferEvaluation : true
			});

		this.isVisibleEndUnixTime = ko.computed({
				read : function () {
					return ko.unwrap(ths.startUnixTime) !== ko.unwrap(ths.endUnixTime);
				},
				deferEvaluation : true
			});

		this.putWellHistory = function () {
			var wellHistoryData = {
				id : ko.unwrap(ths.id),
				startUnixTime : ko.unwrap(ths.startUnixTime),
				endUnixTime : ko.unwrap(ths.endUnixTime),
				wellId : ko.unwrap(ths.wellId),
				historyText : ko.unwrap(ths.historyText),
				jobTypeId : ko.unwrap(ths.jobTypeId)
			};

			datacontext.putWellHistory(wellHistoryData);
		};

		this.startUnixTime.subscribe(ths.putWellHistory);
		this.endUnixTime.subscribe(ths.putWellHistory);
		this.jobTypeId.subscribe(ths.putWellHistory);

		this.removeWfmImage = function (itemForDelete) {
			if (confirm('{{capitalizeFirst lang.confirmToDelete}}?')) {
				imageOfHistoryOfWellService.remove(ths.id, itemForDelete.id).done(function () {
					ths.WfmImages.remove(itemForDelete);
				});
			}
		};

		/** Remove file spec of history of well */
		this.removeFileSpecOfHistoryOfWell = function (fileSpecOfHistoryOfWellToRemove) {
			if (confirm('{{capitalizeFirst lang.confirmToDelete}} this file?')) {
				fileSpecOfHistoryOfWellService.remove(ths.id, fileSpecOfHistoryOfWellToRemove.idOfFileSpec).done(function () {
					ths.WellHistoryFiles.remove(fileSpecOfHistoryOfWellToRemove);
				});
			}
		};

		/**
		 * Create file spec of history of well from well section
		 */
		this.postFileSpecOfHistoryOfWell = function (tmpIdOfFileSpec, scsCallback, errCallback) {
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
		this.postImageOfHistoryOfWell = function (tmpIdOfFileSpec, coords, scsCallback) {
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

		if (data.WfmImagesDto) {
			this.WfmImages(importWfmImagesDto(data.WfmImagesDto));
		}

		// No needs. Extracted from root.jobTypeList
		////if (data.JobTypeDto) {
		////    ths.jobType(new JobType(data.JobTypeDto));
		////}
	};

	return exports;
});
