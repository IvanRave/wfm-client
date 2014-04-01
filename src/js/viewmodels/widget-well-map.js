/** @module */
define(['knockout',
		'helpers/app-helper',
		'base-viewmodels/widget-base',
		'viewmodels/map-of-wield',
		'viewmodels/well-marker-of-map-of-wield'],
	function (ko,
		appHelper,
		VwmWidget,
		VwmMapOfWield,
		VwmWellMarkerOfMapOfWield) {
	'use strict';

	/**
	 * Base: widget view model for map of well
	 * @constuctor
	 * @augments {module:base-viewmodels/widget-base}
	 */
	var exports = function (mdlWidget) {
		VwmWidget.call(this, mdlWidget);

		/**
		 * A selected viewmodel of the map marker
		 * @type {module:viewmodels/well-marker-of-map-of-wield}
		 */
		this.slcVwmMapMarker = ko.computed({
				read : this.calcSlcVwmMapMarker,
				deferEvaluation : true,
				owner : this
			});
	};

	/** Inherit from a widget viewmodel */
	appHelper.inherits(exports, VwmWidget);

	/** Calculate a selected marker */
	exports.prototype.calcSlcVwmMapMarker = function () {
		var tmpIdOfMap = ko.unwrap(this.mdlWidget.opts.idOfSlcMapOfWield);
		if (tmpIdOfMap) {

			// List of map markers from a parent well
			var tmpList = ko.unwrap(this.mdlWidget.mdlStageContext.listOfMapMarker);

			// Find a model for a marker by id of the map
			var markerModel = tmpList.filter(function (markerItem) {
					return markerItem.idOfMapOfWield === tmpIdOfMap;
				})[0];

			if (markerModel) {
      
        var tmpKoTransform = this.mdlWidget.opts.transform;
				// Create a view for a map
				// Create a view for a marker, using a map view
				var tmpVwmMap = new VwmMapOfWield(markerModel.getWellFieldMap(), null, tmpKoTransform);
				return new VwmWellMarkerOfMapOfWield(markerModel, null, tmpVwmMap);
			}
		}
	};

	return exports;
});
