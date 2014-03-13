/** @module */
define(['jquery',
		'knockout',
		'helpers/modal-helper',
		'viewmodels/wroup',
		'viewmodels/map-of-wield',
		'base-viewmodels/stage-child-base',
		'base-viewmodels/stage-base'],
	function ($,
		ko,
		modalHelper,
		VwmWroup,
		VwmMapOfWield,
		VwmStageChildBase,
		VwmStageBase) {
	'use strict';

	/**
	 * View for well field maps: contains filtered maps and selected map
	 * @constructor
	 */
	var exports = function (mdlWield, parentVwmWegion, defaultSlcData) {
		////* @param {object} opts - options for this view, like id of selected map, sort direction, filters etc.
		////* @param {Array.<module:models/map-of-wield>} koMapsOfWield - models for maps (knockout wrapped)

		/** Getter for a parent */
		this.getParentVwm = function () {
			return parentVwmWegion;
		};

		this.defaultSlcData = defaultSlcData;

		this.mdlStage = mdlWield;

		this.unq = mdlWield.id;

		/** Link to company file manager */
		this.fmgr = parentVwmWegion.fmgr;

		/**
		 * List of views of well wroups
		 * @type {Array.<module:viewmodels/wroup>}
		 */
		this.listOfVwmChild = ko.computed({
				read : this.buildListOfVwmChild,
				deferEvaluation : true,
				owner : this
			});

		// Has a children (wroups)
		VwmStageChildBase.call(this, defaultSlcData.wroupId);
		// Has sections and widgets
		VwmStageBase.call(this, defaultSlcData.wieldSectionId, parentVwmWegion.unqOfSlcVwmChild);

		/** The list of views of maps of this well field view*/
		this.listOfVwmMapOfWield = ko.computed({
				read : this.buildListOfVwmMapOfWield,
				deferEvaluation : true,
				owner : this
			});

		/** A sorted list */
		this.sortedListOfVwmMapOfWield = ko.computed({
				read : this.getSortedVwmMaps,
				deferEvaluation : true,
				owner : this
			});

		/** Id of selected view of map of well field = id of map */
		this.vidOfSlcVwmMapOfWield = ko.observable();

		/** The selected view of a map of the well field */
		this.slcVwmMapOfWield = ko.computed({
				read : this.getSlcVwmMapOfWield,
				deferEvaluation : true,
				owner : this
			});
	};

	/** Select view */
	exports.prototype.selectVwmMapOfWield = function (vwmMapOfWieldToSelect) {
		this.vidOfSlcVwmMapOfWield(vwmMapOfWieldToSelect.vid);
	};

	/** Set this section as selected */
	exports.prototype.loadSectionContent = function (idOfSectionPattern) {
		switch (idOfSectionPattern) {
		case 'wield-map':
			// Get all maps from this field
			this.mdlStage.loadMapsOfWield();
			break;
		}
	};

	/** Get maps, sorted by name */
	exports.prototype.getSortedVwmMaps = function () {
		// Sort by name
		return ko.unwrap(this.listOfVwmMapOfWield).sort(function (a, b) {
			return ko.unwrap(a.mdlMapOfWield.name) > ko.unwrap(b.mdlMapOfWield.name);
		});
	};

	/** Create a new well group */
	exports.prototype.addVwmWroup = function () {
		var ths = this;
		var inputName = document.createElement('input');
		inputName.type = 'text';
		$(inputName).prop({
			'required' : true
		}).addClass('form-control');

		var innerDiv = document.createElement('div');
		$(innerDiv).addClass('form-horizontal').append(
			modalHelper.gnrtDom('Name', inputName));

		function submitFunction() {
			ths.mdlStage.postWroup($(inputName).val());

			modalHelper.closeModalWindow();
		}

		modalHelper.openModalWindow('Well group', innerDiv, submitFunction);
	};

  /** Remove a viewmodel with model */
  exports.prototype.removeVwmMapOfWield = function(vwmMapOfWield){
    var tmpModel = vwmMapOfWield.mdlMapOfWield;
    if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(tmpModel.name) + '"?')) {
      this.mdlStage.removeMapOfWield(tmpModel);
    }
  };
  
	/**
	 * Create map from file
	 */
	exports.prototype.createMapFromFile = function () {
		this.unzOfSlcVwmSectionFmg(this.mdlStage.stageKey + '-map');
		var ths = this;
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

			ths.mdlStage.postMapOfWield(selectedFileSpecs[0].id, ko.unwrap(selectedFileSpecs[0].name), function () {
				ths.fmgr.hide();
			});
		}

		// Add to observable
		ths.fmgr.okCallback(mgrCallback);

		// Notification
		ths.fmgr.okDescription('Please select a file for a map');

		// Open file manager
		ths.fmgr.show();
	};

	/** Get the selected viewmodel of a map of a well field */
	exports.prototype.getSlcVwmMapOfWield = function () {
		var tmpVid = ko.unwrap(this.vidOfSlcVwmMapOfWield);
		var tmpListOfVwm = ko.unwrap(this.sortedListOfVwmMapOfWield);
		if (tmpVid) {
			return tmpListOfVwm.filter(function (elem) {
				return elem.vid === tmpVid;
			})[0];
			// CAUTION: few viewmodels from one field model
		} else {
			var tmpFirstVwm = tmpListOfVwm[0];
			if (tmpFirstVwm) {
				this.vidOfSlcVwmMapOfWield(tmpFirstVwm.vid);
				// Select first map if no selected
				return tmpFirstVwm;
			}
		}
	};

	/** Build the list of viewmodels of maps */
	exports.prototype.buildListOfVwmMapOfWield = function () {
		var ths = this;
		return ko.unwrap(this.mdlStage.WellFieldMaps).map(function (elem) {
      // Check if the viewmodel exists, then replace instead creation
			return new VwmMapOfWield(elem, ths.vidOfSlcVwmMapOfWield, ko.observable({
					scale : 1,
					translate : [0, 0]
				}));
		});
	};

	/** Build the list of childs (well groups) */
	exports.prototype.buildListOfVwmChild = function () {
		var ths = this;
		return ko.unwrap(this.mdlStage.wroups).map(function (elem) {
			return new VwmWroup(elem, ths, ths.defaultSlcData);
		});
	};

	/**
	 * Select all ancestor's view models
	 */
	exports.prototype.selectAncestorVwms = function () {
		// 1. take parent view - company
		// 2. take parent view of employee - userprofile
		this.getParentVwm().unqOfSlcVwmChild(this.unq);
		this.getParentVwm().selectAncestorVwms();
	};

	return exports;
});
