/** @module */
define(['knockout',
		'helpers/history-helper',
		'viewmodels/section-of-stage',
		'viewmodels/widgout'],
	function (ko,
		historyHelper,
		VwmStageSection,
		VwmWidgout) {
	'use strict';

	/**
	 * Base for stages
	 * @constructor
	 */
	var exports = function (partOfUnzOfSlcVwmSectionWrk, koUnqOfSlcVwmStage) {

		var ths = this;
		
		/////** By default: view unique id = model.id */
		////this.unq = ths.mdlStage.id;

		/**
		 * Whether stage content is selected and showed on the page (child object are not selected)
		 * @type {boolean}
		 */
		this.isActiveVwmStage = ko.computed({
				read : function () {
					// If stage is selected (or not exists)
					// isSlcVwmStage = koSlcVwmChild === this
					// 1. Is this stage is selected
					if (ko.unwrap(ths.unq) === ko.unwrap(koUnqOfSlcVwmStage)) {
						// 2. And no selected childs
						// Well stage is always selected (has no children)
						if (!ko.unwrap(ths.slcVwmChild)) {
							console.log('stage is showed', ths.mdlStage.stageKey);
							// TODO: 3. And all parents are selected
							return true;
						}
					}

					return false;
				},
				deferEvaluation : true,
				owner : this
			});

		/** List of section views */
		this.listOfVwmSection = ko.computed({
				read : this.buildListOfVwmSection,
				deferEvaluation : true,
				owner : this
			});

		/** Unique id of selected section in file manager */
		this.unzOfSlcVwmSectionFmg = ko.observable();

		/** Selected section in file manager */
		this.slcVwmSectionFmg = ko.computed({
				read : this.calcSlcVwmSectionFmg,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Load files for this file section
		 */
		this.slcVwmSectionFmg.subscribe(this.handleVwmSectionFmg, this);

		/** Id of view of selected section: unz = section pattern */
		this.unzOfSlcVwmSectionWrk = ko.observable();

		/** Selected section in workspace */
		this.slcVwmSectionWrk = ko.computed({
				read : this.calcSlcVwmSectionWrk,
				deferEvaluation : true,
				owner : this
			});

		/** When change selected section */
		this.slcVwmSectionWrk.subscribe(this.handleVwmSectionWrk, this);

		/**
		 * List of views of widget layouts
		 * @type {Array.<module:viewmodels/widgout>}
		 */
		this.listOfVwmWidgout = ko.computed({
				read : this.buildListOfVwmWidgout,
				deferEvaluation : true,
				owner : this
			});

		/** Selected widget layouts: may be defined by default from client storage (cookies..) */
		this.slcVwmWidgout = ko.observable();

		// ==================================== Data loading ================================================

		// When default section is defined (through url or smth else)
		// Load its
		if (partOfUnzOfSlcVwmSectionWrk) {
			// All sections loaded with stages
			// Section model contains all sections (loaded)

			// and load
			// Only once
			this.unzOfSlcVwmSectionWrk(ths.mdlStage.stageKey + '-' + partOfUnzOfSlcVwmSectionWrk);
			// Then delete, to not-repeat this value again
			partOfUnzOfSlcVwmSectionWrk = null;

			// Find need section
			////var tmpNeedVwmSection = ko.unwrap(ths.listOfVwmSection).filter(function (elem) {
			////    return elem.unz === ();
			////})[0];

			////if (!tmpNeedVwmSection) { throw new Error('Not found such section:' + partOfUnzOfSlcVwmSectionWrk); }
		}
		////else {
		////    // Select dashboard
		////    this.unzOfSlcVwmSectionWrk(null);
		////    ////this.unzOfSlcVwmSectionWrk(null);
		////    ////this.unselectVwmSectionWrk();
		////}
	};

	/** Handle a file manager section */
	exports.prototype.handleVwmSectionFmg = function (tmpSlcVwmSection) {
		if (tmpSlcVwmSection) {
			// Load files from server (if not loaded)
			// If loaded - clean selected states
			tmpSlcVwmSection.mdlSection.loadListOfFileSpec();
		}
	};

	/** Handle a work section */
	exports.prototype.handleVwmSectionWrk = function (vwmSectionItem) {
		console.log('subscribe section', vwmSectionItem);
		var navigationArr = historyHelper.getNavigationArr(this.mdlStage);

		if (vwmSectionItem) {
			if (this.loadSectionContent) {
				this.loadSectionContent(vwmSectionItem.mdlSection.sectionPatternId);
			}

			// Add data to the url
			navigationArr.push('sections');
			navigationArr.push(vwmSectionItem.mdlSection.sectionPatternId.split('-')[1]);
		} else if (vwmSectionItem === null) {
			console.log('unselect section (load dashboard)');

			this.mdlStage.loadWidgouts();

			if (this.mdlStage.loadDashboard) {
				this.mdlStage.loadDashboard();
			}
		} else {
			throw new Error('VwmSection can not be undefined (only in init step)');
		}

		historyHelper.pushState('/' + navigationArr.join('/'));
	};

	/** Select file for any image */
	exports.prototype.selectImgFileSpec = function (fileSpecProp) {
		var ths = this;
		// Every stage has property fmgr, which is link to company fmgr
		// Get file manager object from company view
		// Show file manager
		// Select file
		// Send to need function

		ths.unzOfSlcVwmSectionFmg(ths.mdlStage.stageKey + '-summary');

		ths.fmgr.okCallback(function () {
			ths.fmgr.okError('');
			// Select file from file manager
			var slcVwmSection = ko.unwrap(ths.slcVwmSectionFmg);

			if (!slcVwmSection) {
				throw new Error('No selected section when select image file for stage propery');
			}

			var selectedFileSpecs = ko.unwrap(slcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
					return ko.unwrap(elem.isSelected);
				});

			if (selectedFileSpecs.length !== 1) {
				ths.fmgr.okError('need to select one file');
				return;
			}

			// Get prop id
			ths.mdlStage[fileSpecProp.addtData.nestedClientId](selectedFileSpecs[0].id);
			ths.mdlStage.save();
			ths.fmgr.hide();
		});

		ths.fmgr.okDescription('Please select one image');

		ths.fmgr.show();
	};

	/** Remove widget layout from this stage */
	exports.prototype.removeVwmWidgout = function (vwmWidgoutToRemove) {
		if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(vwmWidgoutToRemove.mdlWidgout.name) + '"?')) {
			// Remove model -> autoremoving viewmodel
			this.mdlStage.removeWidgout(vwmWidgoutToRemove.mdlWidgout);
		}
	};

	/** Select section */
	exports.prototype.selectVwmSectionWrk = function (vwmSectionToSelect) {
		// Select id -> auto selection for view
		this.unzOfSlcVwmSectionWrk(vwmSectionToSelect.unz);
	};

	/** Choose dashboard (no section */
	exports.prototype.unselectVwmSectionWrk = function () {
		this.unzOfSlcVwmSectionWrk(null);
	};

	/** Calculate a selected viewmodel of a work section */
	exports.prototype.calcSlcVwmSectionWrk = function () {
		var tmpUnzOfSlcVwmSectionWrk = ko.unwrap(this.unzOfSlcVwmSectionWrk);
		if (tmpUnzOfSlcVwmSectionWrk) {
			// Find section with this pattern id
			return ko.unwrap(this.listOfVwmSection).filter(function (elem) {
				return elem.unz === tmpUnzOfSlcVwmSectionWrk;
			})[0];
		} else if (tmpUnzOfSlcVwmSectionWrk === null) {
			return null;
		}
	};

	/** Select file section (in file manager) */
	exports.prototype.selectVwmSectionFmg = function (vwmSectionToSelect) {
		// Set as a selected to show files
		this.unzOfSlcVwmSectionFmg(vwmSectionToSelect.unz);
	};

	/** Build a list with widget layout viewmodels */
	exports.prototype.buildListOfVwmWidgout = function () {
		return ko.unwrap(this.mdlStage.widgouts).map(function (elem) {
			return new VwmWidgout(elem, this);
		}, this);
	};

	/** Calculate a selected viewmodel of a file manager section */
	exports.prototype.calcSlcVwmSectionFmg = function () {
		var tmpUnzOfSlcVwmSection = ko.unwrap(this.unzOfSlcVwmSectionFmg);
		if (tmpUnzOfSlcVwmSection) {
			// Find section with this pattern id
			return ko.unwrap(this.listOfVwmSection).filter(function (elem) {
				return elem.unz === tmpUnzOfSlcVwmSection;
			})[0];
		} else if (tmpUnzOfSlcVwmSection === null) {
			return null;
		}
	};

	/** Build a list with viewmodels of sections */
	exports.prototype.buildListOfVwmSection = function () {
		var tmpListOfSection = ko.unwrap(this.mdlStage.listOfSection);
		return tmpListOfSection.map(function (elem) {
			return new VwmStageSection(elem, this);
		}, this);
	};

	return exports;
});
