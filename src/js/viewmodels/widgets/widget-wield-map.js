/** @module */
define(['knockout', 'viewmodels/map-of-wield'], function (ko, VwmMapOfWield) {
	'use strict';

	/**
	 * Base: widget view model for map of well field
	 * @constuctor
	 */
	var exports = function (opts, mdlWield) {
		opts = opts || {};

		var ths = this;

		/**
		 * Selected view map
		 */
		this.slcVwmMapOfWield = ko.computed({
				read : function () {
					var tmpVid = ko.unwrap(ths.vidOfSlcVwmMapOfWield);
					if (tmpVid) {
						var needMapModel = ko.unwrap(mdlWield.WellFieldMaps).filter(function (elem) {
								return elem.id === tmpVid;
							})[0];

						if (needMapModel) {
							var needVwm = new VwmMapOfWield(needMapModel, ths.vidOfSlcVwmMapOfWield,
									opts['TransformScale'],
									opts['TransformTranslate']);

							// Remove default options for translate (after the first success initialization)
							delete opts['TransformScale'];
							delete opts['TransformTranslate'];

							return needVwm;
						}
					}
				},
				deferEvaluation : true
			});

		/**
		 * Viewmodel id of selected map viewmodel
		 */
		this.vidOfSlcVwmMapOfWield = ko.observable(opts['IdOfSlcMapOfWield']);

		/**
		 * Dictionary for select box (value, text) with maps
		 */
		this.dictOfMap = ko.computed({
				read : function () {
					return ko.unwrap(mdlWield.WellFieldMaps).map(function (elem) {
						return {
							optText : ko.unwrap(elem.name),
							optValue : ko.unwrap(elem.id)
						};
					});
				},
				deferEvaluation : true
			});

		/** Whether name of map is visible */
		this.isVisName = ko.observable(opts['IsVisName']);

		/** Whether map is visible */
		this.isVisImg = ko.observable(opts['IsVisImg']);

		/** Convert to plain JSON to send to the server as widget settings */
		this.toStringifyOpts = function () {
			var tmpSlcVwm = ko.unwrap(ths.slcVwmMapOfWield);

			return JSON.stringify({
				'IdOfSlcMapOfWield' : tmpSlcVwm ? tmpSlcVwm.vid : null,
				'IsVisName' : ko.unwrap(ths.isVisName),
				'IsVisImg' : ko.unwrap(ths.isVisImg),
				'TransformScale' : tmpSlcVwm ? ko.unwrap(tmpSlcVwm.transformAttr).scale : null,
				'TransformTranslate' : tmpSlcVwm ? ko.unwrap(tmpSlcVwm.transformAttr).translate : null
			});
		};
	};

	return exports;
});
