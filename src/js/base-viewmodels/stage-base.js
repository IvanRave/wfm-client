/** @module */
define(['knockout',
		'helpers/history-helper',
		'viewmodels/section-of-stage',
		'viewmodels/widgout',
		'constants/stage-view-constants',
		'viewmodels/fmgr-modal'],
	function (ko,
		historyHelper,
		VwmStageSection,
		VwmWidgout,
		stageViewConstants,
		FmgrModal) {

	'use strict';

	/**
	 * Base for stages
	 * @constructor
	 */
	var exports = function (partOfUnzOfSlcVwmSectionWrk, koUnqOfSlcVwmStage, defaultUnqOfSlcVwmChild) {
		/**
		 * Unique value of selected stage in parent stage
		 * @private
		 */
		this.koUnqOfSlcVwmStage = koUnqOfSlcVwmStage;

		/////** By default: view unique id = model.id */

		/** Whether this stage is selected */
		this.isSlcVwmStage = ko.computed({
				read : this.calcIsSlcVwmStage,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Whether stage content is selected and showed on the page (child object are not selected)
		 * @type {boolean}
		 */
		this.isActiveVwmStage = ko.computed({
				read : this.calcIsActiveVwmStage,
				deferEvaluation : true,
				owner : this
			});

		/** Unique id of selected section in file manager */
		this.unzOfSlcVwmSectionFmg = ko.observable();

		/**
		 * User profile may contain few employee (with companies)
		 * @type {Array.<module:viewmodels/employee>}
		 */
		this.listOfVwmChild = ko.computed({
				read : this.buildListOfVwmChild,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * List of views of widget layouts
		 * @type {Array.<module:viewmodels/widgout>}
		 */
		this.listOfVwmWidgout = ko.computed({
				read : this.buildListOfVwmWidgout,
				deferEvaluation : true,
				owner : this
			});

		/** List of section views */
		this.listOfVwmSection = ko.computed({
				read : this.buildListOfVwmSection,
				deferEvaluation : true,
				owner : this
			});

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

		/**
		 * Whether is no selected section
		 * @type {boolean}
		 */
		this.isNullSlcVwmSectionWrk = ko.computed({
				read : this.calcIsNullSlcVwmSectionWrk,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Current stage view
		 *    an id string from constants/stage-view-constants
		 * @type {string}
		 */
		this.slcStageView = ko.observable();

		/** Whether a selected stage view is a dashboard */
		this.isSlcStageViewDashboard = ko.computed({
				read : function () {
					return ko.unwrap(this.slcStageView) === stageViewConstants.dashboard.id;
				},
				deferEvaluation : true,
				owner : this
			});

		/** Whether a selected stage view is a dashboard */
		this.isSlcStageViewFmgr = ko.computed({
				read : function () {
					return ko.unwrap(this.slcStageView) === stageViewConstants.fmgr.id;
				},
				deferEvaluation : true,
				owner : this
			});

		/** Whether a selected stage view is a dashboard */
		this.isSlcStageViewSection = ko.computed({
				read : function () {
					return ko.unwrap(this.slcStageView) === stageViewConstants.section.id;
				},
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Pattern of a selected section
		 * @type {string}
		 */
		this.patternOfSlcVwmSectionWrk = ko.computed({
				read : this.calcPatternOfSlcVwmSectionWrk,
				deferEvaluation : true,
				owner : this
			});

		/** When change selected section */
		this.slcVwmSectionWrk.subscribe(this.handleVwmSectionWrk, this);

		/** Selected widget layouts: may be defined by default from client storage (cookies..) */
		this.slcVwmWidgout = ko.observable();

		//{ #region FMGR

		/**
		 * File manager as modal window for this view: created from modalFileMgr
		 * @type {module:viewmodels/fmgr-modal}
		 */
		this.fmgrModal = new FmgrModal();

		//} #endregion FMGR

		//{ #region FORSTAGESWITHCHILDREN

		/** Unique key of viewmodel of selected child, null - for the bottom stage (the Well) */
		this.unqOfSlcVwmChild = ko.observable(defaultUnqOfSlcVwmChild);

		//// Remove default value to not reuse again
		//defaultUnqOfSlcVwmChild = null;

		/** Child viewmodel - current selected employee */
		this.slcVwmChild = ko.computed({
				read : this.calcSlcVwmChild,
				deferEvaluation : true,
				owner : this
			});

		/** Open child after selection */
		this.slcVwmChild.subscribe(this.handleSlcVwmChild, this);

		/**
		 * Whether menu item is opened: showed inner object in menu without main content
		 *    Only for sections that have children
		 * @type {boolean}
		 */
		this.isOpenedItem = ko.observable(false);

		/** Css class for opened item (open or showed) */
		this.menuItemCss = ko.computed({
				read : this.calcMenuItemCss,
				deferEvaluation : true,
				owner : this
			});

		//} #endregion

		// ==================================== Data loading ================================================

		// When default section is defined (through url or smth else)
		// Load its
		if (partOfUnzOfSlcVwmSectionWrk) {
			// All sections loaded with stages
			// Section model contains all sections (loaded)

			// and load
			// Only once
			this.unzOfSlcVwmSectionWrk(this.mdlStage.stageKey + '-' + partOfUnzOfSlcVwmSectionWrk);
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
		// Select a file
		// Send to need function

		ths.unzOfSlcVwmSectionFmg(ths.mdlStage.stageKey + '-summary');

		ths.fmgrModal.okCallback(function () {
			ths.fmgrModal.okError('');
			// Select file from file manager
			var slcVwmSection = ko.unwrap(ths.slcVwmSectionFmg);

			if (!slcVwmSection) {
				throw new Error('No selected section when select image file for stage propery');
			}

			var selectedFileSpecs = ko.unwrap(slcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
					return ko.unwrap(elem.isSelected);
				});

			if (selectedFileSpecs.length !== 1) {
				ths.fmgrModal.okError('need to select one file');
				return;
			}

			// Get prop id
			ths.mdlStage[fileSpecProp.addtData.nestedClientId](selectedFileSpecs[0].id);
			ths.mdlStage.save();
			ths.fmgrModal.hide();
		});

		ths.fmgrModal.okDescription('Please select one image');

		ths.fmgrModal.show();
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

	/** Choose dashboard (no section) */
	exports.prototype.showStageViewDashboard = function () {
		this.unzOfSlcVwmSectionWrk(null);
		// Select a stage view
		this.slcStageView(stageViewConstants.dashboard.id);
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

	/**
	 * Select this stage and all ancestors
	 */
	exports.prototype.selectAncestorVwms = function () {
		// For the upper stage (user profile) no parents - nothing to select
		var tmpParentVwm = this.getParentVwm();
		if (tmpParentVwm) {
			// Select this stage
			tmpParentVwm.unqOfSlcVwmChild(this.unq);
			// Select all parent stages (in asc order)
			tmpParentVwm.selectAncestorVwms();
		}
	};

	/** Calculate, wheter all ancestors are selected */
	exports.prototype.calcIsSlcAncestorVwms = function () {
		var result = true;
		var tmpParentVwm = this.getParentVwm();
		// If no parent (in first time) that it is a Upro stage (user profile)
		// In this case - always true
		while (tmpParentVwm) {
			// If one of the parent is false, then result will be false;
			result = ko.unwrap(tmpParentVwm.isSlcVwmStage);
			if (result === false) {
				break;
			}

			tmpParentVwm = tmpParentVwm.getParentVwm();
		}

		return result;
	};

	/**
	 * Build list of childrens' viewmodels
	 */
	exports.prototype.buildListOfVwmChild = function () {
		throw new Error('Need to ovveride in a subclass if there are stage children');
	};

	/**
	 * Remove child stage with view model (only for stages with children)
	 */
	exports.prototype.removeVwmChild = function (vwmChildToRemove) {
		// In case upro (parent) - company (child)
		var tmpMdlStage = vwmChildToRemove.mdlStage;
		// Name - can be uppercase or lowercase
		var tmpName = tmpMdlStage.name ? ko.unwrap(tmpMdlStage.name) : ko.unwrap(tmpMdlStage.Name);

		if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + tmpName + '"?')) {
			this.mdlStage.removeChild(tmpMdlStage);
		}
	};

	/** Calculate a selected viewmodel of a child stage */
	exports.prototype.calcSlcVwmChild = function () {
		var tmpUnq = ko.unwrap(this.unqOfSlcVwmChild);
		if (tmpUnq) {
			return ko.unwrap(this.listOfVwmChild).filter(function (elem) {
				return elem.unq === tmpUnq;
			})[0];
		}
	};

	/** Make actions (open a stage) after select a new child stage */
	exports.prototype.handleSlcVwmChild = function (tmpSlcVwmChild) {
		if (tmpSlcVwmChild) {
			if (typeof(tmpSlcVwmChild.isOpenedItem) !== 'undefined') {
				tmpSlcVwmChild.isOpenedItem(true);
			}
		}
	};

	/**
	 * Activate view of child stage: select all parents
	 *    1. Unselect all children
	 *    2. Select this
	 *    3. Select all parents (For userProfile - employee (company))
	 *    4. Set url fot this stage
	 */
	exports.prototype.activateVwmChild = function (vwmChildToActivate) {
		// 1. Change a route
		var navigationArr = historyHelper.getNavigationArr(vwmChildToActivate.mdlStage);
		historyHelper.pushState('/' + navigationArr.join('/'));

		// 2. Clean
		if (typeof(vwmChildToActivate.unqOfSlcVwmChild) !== 'undefined') {
			vwmChildToActivate.unqOfSlcVwmChild(null);
		}

		// 3. Select section. If not a selected section - show dashboard
		if (!ko.unwrap(vwmChildToActivate.unzOfSlcVwmSectionWrk)) {
			vwmChildToActivate.showStageViewDashboard();
		}

		// 4. Select current child
		this.unqOfSlcVwmChild(vwmChildToActivate.unq);

		// 5. Select all parents of this stage
		this.selectAncestorVwms();

		// Unselect all previous sections. If a stage has children, then unselect all children
		// You can't know a previous selected stage
		// Just leave it selected, but in next selection - re-calculate


		// ths - parent (like company)
		// vwmChild - child (like wegion)
		// slcVwmChild - selected child (like wegion)
		// If parent - it is a child of other parent (company, employee -- it is a child of the userprofile)
		// UserProflie.slcVwmChild(thisEmployee of this company)
	};

	/** Unselect: show content of parent node, like WFM logo click: unselect choosed company and show company list */
	exports.prototype.deactivateVwmChild = function () {
		this.unqOfSlcVwmChild(null);

		var navigationArr = historyHelper.getNavigationArr(this.mdlStage);

		historyHelper.pushState('/' + navigationArr.join('/'));
	};

	/** Calculate whether this stage is selected */
	exports.prototype.calcIsSlcVwmStage = function () {
		return ko.unwrap(this.koUnqOfSlcVwmStage) === ko.unwrap(this.unq);
	};

	/** Calculate, whether this stage is active */
	exports.prototype.calcIsActiveVwmStage = function () {
		// If stage is selected (or not exists)
		// isSlcVwmStage = koSlcVwmChild === this
		// 1. Is this stage is selected
		if (ko.unwrap(this.isSlcVwmStage)) {
			// 2. And no selected childs
			// Well stage is always selected (has no children)
			if (!ko.unwrap(this.slcVwmChild)) {
				console.log('stage is showed', this.mdlStage.stageKey);
				// 3. And all parents are selected
				if (this.calcIsSlcAncestorVwms()) {
					return true;
				}
			}
		}

		return false;
	};

	/** Toggle isOpen state */
	exports.prototype.toggleItem = function () {
		this.isOpenedItem(!ko.unwrap(this.isOpenedItem));
	};

	/** Css class for a item of a menu */
	exports.prototype.calcMenuItemCss = function () {
		return ko.unwrap(this.isOpenedItem) ? 'glyphicon-circle-arrow-down' : 'glyphicon-circle-arrow-right';
	};

	/** Calculate pattern id */
	exports.prototype.calcPatternOfSlcVwmSectionWrk = function () {
		var tmpSlcVwmSectionWrk = ko.unwrap(this.slcVwmSectionWrk);
		if (tmpSlcVwmSectionWrk) {
			return tmpSlcVwmSectionWrk.mdlSection.sectionPatternId;
		}
	};

	/** Calculate whether is no selected section (is null) */
	exports.prototype.calcIsNullSlcVwmSectionWrk = function () {
		return ko.unwrap(this.slcVwmSectionWrk) === null;
	};

	return exports;
});
