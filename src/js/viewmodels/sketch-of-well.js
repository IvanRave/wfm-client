/** @module */
define(['knockout'], function (ko) {
	'use strict';

	/**
	 * Viewmodel: sketch of well
	 * @constructor
	 */
	var exports = function (mdlSketchOfWell, koWellUnzOfSlcVwmSectionFmg, koSlcVwmSectionFmg, fmgrModalLink) {
		this.mdlSketchOfWell = mdlSketchOfWell;

		this.fmgrModal = fmgrModalLink;

		this.koWellUnzOfSlcVwmSectionFmg = koWellUnzOfSlcVwmSectionFmg;

		this.koSlcVwmSectionFmg = koSlcVwmSectionFmg;
	};

	/** Create sketch from file: select file and create sketch */
	exports.prototype.createSketchFromFile = function () {
		var ths = this;
		var tmpMdlWell = ths.mdlSketchOfWell.getWell();

		// Select file section with sketches (load and unselect files)
		ths.koWellUnzOfSlcVwmSectionFmg(tmpMdlWell.stageKey + '-sketch');
		//var tmpFmgrModal = ths.fmgr
		// Calback for selected file
		function mgrCallback() {
			ths.fmgrModal.okError('');

			var tmpSlcVwmSection = ko.unwrap(ths.koSlcVwmSectionFmg);

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

			ths.mdlSketchOfWell.putSketchOfWell(selectedFileSpecs[0].id, ko.unwrap(selectedFileSpecs[0].name), function () {
				ths.fmgrModal.hide();
			});
		}

		// Add to observable
		ths.fmgrModal.okCallback(mgrCallback);

		// Notification
		ths.fmgrModal.okDescription('Please select a file for a sketch image');

		// Open file manager
		ths.fmgrModal.show();
	};

	return exports;
});
