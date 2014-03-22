/** @module */
define(['knockout',
		'models/file-spec',
		'models/widgout',
		'services/widgout'],
	function (ko,
		FileSpec,
		Widgout,
		widgoutService) {
	'use strict';

	/** Import widget layouts to the stage */
	function importWidgouts(data, parentItem) {
		return (data || []).map(function (item) {
			return new Widgout(item, parentItem);
		});
	}

	/**
	 * Base for all stages: well, group, region etc.
	 *    every stage contains stageKey
	 */
	var exports = function (data) {

		/** Props values: all observables */
		this.propSpecList.forEach(function (prop) {
			if (prop.tpe === 'FileLine') {
				// Create a new observable file specification
				this[prop.clientId] = ko.observable();
				// If the file exists - create its object
				if (data[prop.serverId]) {
					this[prop.clientId](new FileSpec(data[prop.serverId]));
				}
			} else {
				this[prop.clientId] = ko.observable(data[prop.serverId]);
			}
		}, this);

		/** List of sections */
		this.listOfSection = ko.observableArray();
    
		/**
		 * List of section patterns for current stage (names, ids, etc.)
		 *    Section patterns where idOfStage === stageKey
		 * @type {Array.<module:models/section-pattern>}
		 */
		this.stagePatterns = ko.computed({
				read : this.calcStagePatterns,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * List of patterns for widgets
		 * @type {Array.<module:models/section-pattern>}
		 */
		this.stagePatternsForWidget = ko.computed({
				read : this.calcStagePatternsForWidget,
				deferEvaluation : true,
				owner : this
			});

		/** Widget layouts of this stage */
		this.widgouts = ko.observableArray();

		/**
		 * Is loaded widget layouts
		 * @type {boolean}
		 */
		this.isLoadedWidgouts = ko.observable(false);

		/** Possible widget layout list to insert */
		this.widgoutTemplates = widgoutService.getWidgoutTemplates();

		/** Selected possible widget layout for adding to widget layout list */
		this.slcWidgoutTemplate = ko.observable();
	};

	/** Get a need property from array */
	exports.prototype.getPropSpecByClientId = function (clientId) {
		var filteredProps = this.propSpecList.filter(function (elem) {
				return elem.clientId === clientId;
			});

		return filteredProps[0];
	};

	/** Get stage patterns, filtered only for widgets */
	exports.prototype.calcStagePatternsForWidget = function () {
		var tmpStagePatterns = ko.unwrap(this.stagePatterns);
		return tmpStagePatterns.filter(function (elem) {
			return elem.isWidget;
		});
	};

	/**
	 * Delete only a link to the file - without removing physically and from section
	 * @param {module/prop-spec} fileSpecProp - Property data
	 */
	exports.prototype.deleteImgFileSpec = function (fileSpecProp) {
		// Clean property of this image and nested property with image link (like FileSpec and idOfFileSpec)
		this[fileSpecProp.addtData.nestedClientId](null);
		this[fileSpecProp.clientId](null);

		// Every stage has a save method to save current state of model
		this.save();

		////var tmpFileSpecElem = ko.unwrap(ths[fileSpecProp.clientId]);
		////if (!tmpFileSpecElem) { return; }
		////// Select file section with logos

		////var idOfFileSpec = tmpFileSpecElem.id;
		////console.log(idOfFileSpec);
		////var needSection = asdf('company-summary');
		////// Remove from file section + clean FileSpec (delete from logo tables)
		////needSection.deleteFileSpecById(idOfFileSpec, function () {
		////ths[fileSpecProp.addtData.nestedClientId](null);
		////ths[fileSpecProp.clientId](null);
		////});
	};

	/** Create a widget layout */
	exports.prototype.postWidgout = function () {
		var ths = this;
		var tmpWidgoutTemlate = ko.unwrap(this.slcWidgoutTemplate);
		if (tmpWidgoutTemlate) {
			widgoutService.post(ths.stageKey, ths.id || ths.Id, tmpWidgoutTemlate).done(function (createdWellWidgoutData) {
				var widgoutNew = new Widgout(createdWellWidgoutData, ths);
				ths.widgouts.push(widgoutNew);
				ths.slcWidgoutTemplate(null);
			});
		}
	};

	/** Remove a widget layout */
	exports.prototype.removeWidgout = function (widgoutToRemove) {
		var ths = this;
		widgoutService.remove(ths.stageKey, ths.id || ths.Id, widgoutToRemove.id).done(function () {
			ths.widgouts.remove(widgoutToRemove);
		});
	};

	/** Load widget layouts for a stage */
	exports.prototype.loadWidgouts = function () {
		var ths = this;
		if (ko.unwrap(ths.isLoadedWidgouts)) {
			return;
		}

		widgoutService.get(ths.stageKey, ths.id || ths.Id).done(function (res) {
			ths.widgouts(importWidgouts(res, ths));
			ths.isLoadedWidgouts(true);
		});
	};

	/** Calculate patterns for this stage */
	exports.prototype.calcStagePatterns = function () {
		// List of all section patterns
		var ths = this;
		var tmpAllPatterns = ko.unwrap(ths.getRootMdl().ListOfSectionPatternDto);
		return tmpAllPatterns.filter(function (elem) {
			return elem.idOfStage === ths.stageKey;
		});
	};

	/** Remove a child stage */
	exports.prototype.removeChild = function () {
		throw new Error('Need to override in a subclass');
	};

	return exports;
});
