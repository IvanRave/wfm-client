/** @module */
define([
		'jquery',
		'knockout',
		'helpers/modal-helper'],
	function (
		$,
		ko,
		bootstrapModal) {
	'use strict';

	/**
	 * Viewmodel: history of well
	 * @constructor
	 */
	var exports = function (mdlHistoryOfWell, vwmWell, 
    koStartUnixTime, koEndUnixTime, koIdOfSlcJobType) {

		/**
		 * Getter for a well viewmodel
		 */
		this.getVwmWell = function () {
			return vwmWell;
		};

		this.filterUnixTime = {
			start : koStartUnixTime,
			end : koEndUnixTime
		};

		this.idOfSlcJobType = koIdOfSlcJobType;

		/**
		 * Model: history of well
		 * @type {module:models/history-of-well}
		 */
		this.mdlHistoryOfWell = mdlHistoryOfWell;

		/**
		 * Whether history record is visible (filtered)
		 * @type {boolean}
		 */
		this.isVisible = ko.computed({
				read : this.checkIsVisibleRecord,
				deferEvaluation : true,
				owner : this
			});
	};

	/**
	 * Create file spec for history of well
	 */
	exports.prototype.createFileSpecOfHistoryOfWell = function () {
		var ths = this;
		// Select file section with history files (load and unselect files)
		var tmpVwmWell = this.getVwmWell();
		tmpVwmWell.unzOfSlcVwmSectionFmg(tmpVwmWell.mdlStage.stageKey + '-history');
		var fmgrModal = tmpVwmWell.fmgrModal;
		// Calback for selected file
		function mgrCallback() {
			fmgrModal.okError('');

			var tmpSlcVwmSection = ko.unwrap(tmpVwmWell.slcVwmSectionFmg);

			if (!tmpSlcVwmSection) {
				throw new Error('No selected section');
			}

			// Select file from file manager
			var selectedFileSpecs = ko.unwrap(tmpSlcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
					return ko.unwrap(elem.isSelected);
				});

			if (selectedFileSpecs.length !== 1) {
				fmgrModal.okError('need to select one file');
				return;
			}

			ths.mdlHistoryOfWell.postFileSpecOfHistoryOfWell(selectedFileSpecs[0].id, function () {
				fmgrModal.hide();
			}, function (jqXhr) {
				if (jqXhr.status === 422) {
					var resJson = jqXhr.responseJSON;
					require(['helpers/lang-helper'], function (langHelper) {
						var tmpProcessError = (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
						fmgrModal.okError(tmpProcessError);
					});
				}
			});
		}

		// Add to observable
		fmgrModal.okCallback(mgrCallback);

		// Notification
		fmgrModal.okDescription('Please select a file for this history record');

		// Open file manager
		fmgrModal.show();
	};

	/**
	 * Create cropped image from file (for history of well)
	 */
	exports.prototype.createImageFromFileSpec = function () {
		var ths = this;
		var tmpVwmWell = this.getVwmWell();
		tmpVwmWell.unzOfSlcVwmSectionFmg(tmpVwmWell.mdlStage.stageKey + '-history');
		var fmgrModal = this.getVwmWell().fmgrModal;

		function mgrCallback() {
			fmgrModal.okError('');

			var tmpSlcVwmSection = ko.unwrap(tmpVwmWell.slcVwmSectionFmg);

			if (!tmpSlcVwmSection) {
				throw new Error('No selected section');
			}

			// Select file from file manager
			var selectedFileSpecs = ko.unwrap(tmpSlcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
					return ko.unwrap(elem.isSelected);
				});

			if (selectedFileSpecs.length !== 1) {
				fmgrModal.okError('need to select one file');
				return;
			}

			var imageFileSpec = selectedFileSpecs[0];

			fmgrModal.hide();

			// history image src
			var innerDiv = document.createElement('div');
			var historyImgElem = document.createElement('img');
			innerDiv.appendChild(historyImgElem);
			// load image before open window and set JCrop
			historyImgElem.onload = function () {
				// load need libraries for cropping
				require(['jquery.Jcrop'], function () {
					var coords = [0, 0, 0, 0];

					function jcropSaveCoords(c) {
						coords = [c.x, c.y, c.x2, c.y2];
					}

					// The variable jcrop_api will hold a reference to the Jcrop API once Jcrop is instantiated
					$(historyImgElem).Jcrop({
						onChange : jcropSaveCoords,
						onSelect : jcropSaveCoords,
						bgOpacity : 0.6
					});

					// submitted by OK button
					bootstrapModal.openModalWideWindow(innerDiv, function () {
						// TODO: check not null comments = if user can't choose whole images
						ths.mdlHistoryOfWell.postImageOfHistoryOfWell(imageFileSpec.id, coords, function () {
							bootstrapModal.closeModalWideWindow();
						});
					}, 'Please select area to crop');
					// end of require
				});
			};

			// Start load an image
			historyImgElem.src = imageFileSpec.fileUrl;
		}
		// Add to observable
		fmgrModal.okCallback(mgrCallback);

		// Notification
		fmgrModal.okDescription('Please select a history image to crop');

		// Open file manager
		fmgrModal.show();
	};

  /**
  * Check whether is this record visible
  */
	exports.prototype.checkIsVisibleRecord = function () {
		var ths = this;
		var tmpFilterUnixTime = ko.toJS(this.filterUnixTime);

		console.log('tmpFilterUnixTime', tmpFilterUnixTime);

		// Step 1: filter by date
		if (tmpFilterUnixTime.start || tmpFilterUnixTime.end) {
			var tmpElemUnixTime = {
				start : ko.unwrap(ths.mdlHistoryOfWell.startUnixTime),
				end : ko.unwrap(ths.mdlHistoryOfWell.endUnixTime)
			};

			console.log('tmpElemUnixTime', tmpElemUnixTime);

			if (tmpFilterUnixTime.start && (tmpFilterUnixTime.start > tmpElemUnixTime.start)) {
				return false;
			}

			if (tmpFilterUnixTime.end && (tmpFilterUnixTime.end < tmpElemUnixTime.end)) {
				return false;
			}
		}

		// Step 2: filter by job type
		var tmpIdOfSlcJobType = ko.unwrap(ths.idOfSlcJobType);

		if (tmpIdOfSlcJobType) {
			if (ko.unwrap(ths.mdlHistoryOfWell.jobTypeId) !== tmpIdOfSlcJobType) {
				return false;
			}
		}

		return true;
	};

	return exports;
});
