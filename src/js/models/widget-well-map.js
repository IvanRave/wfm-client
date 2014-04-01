/** @module */
define(['knockout',
		'helpers/app-helper',
		'base-models/widget-base'],
	function (ko,
		appHelper,
		Widget) {
	'use strict';

	/**
	 * Base: widget model for map of well
	 * @constuctor
	 * @augments {module:base-models/widget-base}
	 */
	var exports = function (data, widgockItem, mdlStageContext) {
		Widget.call(this, data, widgockItem, mdlStageContext);

    var tmpOpts = JSON.parse(data.Opts);
    
    /**
    * An option: id of a selected map
    * @type {number}
    */
    this.opts.idOfSlcMapOfWield = ko.observable(tmpOpts['idOfSlcMapOfWield']);

    /**
    * An option: a transform attribute for a map
    * @type {object}
    */
    this.opts.transform = ko.observable({
				scale : tmpOpts.transform ? (tmpOpts.transform.scale || 1) : 1,
				translate : tmpOpts.transform ? (tmpOpts.transform.translate || [0, 0]) : [0, 0]
			});
    
		/**
		 * A dictionary (name, value) to select need map
		 */
		this.dictOfMapMarker = ko.computed({
				read : this.buildDictOfMapMarker,
				deferEvaluation : true,
				owner : this
			});
	};

	/** Inherit from a widget model */
	appHelper.inherits(exports, Widget);

	/** Convert to plain JSON to send to the server as widget settings */
	exports.prototype.toPlainOpts = function () {
    return ko.toJSON(this.opts);
	};

	/** Build a dictionary with key-values */
	exports.prototype.buildDictOfMapMarker = function () {
		// Markers from the well (filtered by IdOfWell and IsDrilled)
		var tmpMarkers = ko.unwrap(this.mdlStageContext.listOfMapMarker);
		return tmpMarkers.map(function (markerItem) {
			return {
				optValue : ko.unwrap(markerItem.idOfMapOfWield),
				optText : ko.unwrap(markerItem.nameOfMap)
			};
		});
	};

	return exports;
});
