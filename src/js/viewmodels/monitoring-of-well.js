/** @module */
define(['jquery', 'knockout', 'viewmodels/svg-graph'], function ($, ko, SvgGraph) {
	'use strict';

	/**
	 * A shared monitoring viewmodel for widgets and sections
	 * @constructor
	 */
	var exports = function (opts, mdlWell) {
		/** Alternative */
		var ths = this;

		/**
		 * A date border to filter monitoring data
		 * @type {object}
		 */
		this.mntrUnixTimeBorder = {
			// By default: loaded from server options for a widget
			// no default for main section views
			start : ko.observable(),
			end : ko.observable()
		};

		/**
		 * Load the list, using filtered dates (if both exists)
		 */
		this.loadFilteredListOfMonitoringRecord = function () {
			var startUnixTime = ko.unwrap(ths.mntrUnixTimeBorder.start);
			if (startUnixTime) {
				var endUnixTime = ko.unwrap(ths.mntrUnixTimeBorder.end);
				if (endUnixTime) {
					mdlWell.loadListOfMonitoringRecord(startUnixTime, endUnixTime);
				}
			}
		};

		// When a user changes filtered dates - reload monitoring records
		this.mntrUnixTimeBorder.start.subscribe(ths.loadFilteredListOfMonitoringRecord);
		this.mntrUnixTimeBorder.end.subscribe(ths.loadFilteredListOfMonitoringRecord);

		//{ #region GRAPH

		/**
		 * Computed array from the time border object
		 */
		this.timeBorderArr = ko.computed({
				read : function () {
					return [ko.unwrap(ths.mntrUnixTimeBorder.start), ko.unwrap(ths.mntrUnixTimeBorder.end)];
				},
				deferEvaluation : true
			});

		/**
		 * Min and max values of curves
		 * @type {Array}
		 * @todo #22! Initialize a logic
		 */
		this.valueBorderArr = ko.computed({
				read : function () {
					var minVal = null,
					maxVal = null;

					var tmpRecords = ko.unwrap(mdlWell.listOfMonitoringRecord);

					tmpRecords.forEach(function (tmpRecord) {
						var tmpDict = tmpRecord.dict;
						for (var paramKey in tmpDict) {
							var paramVal = ko.unwrap(tmpDict[paramKey]);
							if ($.isNumeric(paramVal)) {
								// Set min and max values if they are null
								if (minVal === null && maxVal === null) {
									minVal = maxVal = paramVal;
								} else {
									minVal = Math.min(minVal, paramVal);
									maxVal = Math.max(maxVal, paramVal);
								}
							}
						}
					});

					// Elements of this array can be null
					return [minVal, maxVal];
				},
				deferEvaluation : true
			});

		/**
		 * Array with properties for svg paths
		 * @type {Array.<object>}
		 */
		this.pathsArr = ko.computed({
				read : function () {
					return [];
				},
				deferEvaluation : true
			});

		/**
		 * Main object for graph
		 */
		this.mntrGraph = new SvgGraph(ths.timeBorderArr, ths.valueBorderArr, ths.pathsArr);

		//} #endregion GRAPH

		// Load data (widget or main view options)
		// Automatically will be loaded monitoring records for these dates
		this.mntrUnixTimeBorder.start(opts['StartUnixTime']);
		this.mntrUnixTimeBorder.end(opts['EndUnixTime']);
	};

	return exports;
});
