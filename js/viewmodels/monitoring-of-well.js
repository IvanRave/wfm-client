/**
 * @module
 * @todo #32! When the user selects only one filtered time picker,
 *            need to show the graph with one limit
 */
define(['knockout',
		'viewmodels/svg-graph',
		'd3',
		'viewmodels/wfm-parameter-of-wroup',
		'helpers/monitoring-helper'],
	function (ko,
		SvgGraph,
		d3,
		VwmWfmParameterOfWroup,
		mntrHelper) {
	'use strict';

	/**
	 * A shared monitoring viewmodel for widgets and sections
	 * @constructor
	 * @param {number} optStartUnixTime - Start time for monitoring
	 * @param {number} optEndUnixTime - End time for monitoring
	 *        these times can be loaded as options for a widget
	 *        or as cookie values for a main view
	 */
	var exports = function (mdlWell, koStartUnixTime, koEndUnixTime) {
		this.mdlWell = mdlWell;

		/**
		 * A date border to filter monitoring data
		 * @type {object}
		 */
		this.mntrUnixTimeBorder = {
			// By default: loaded from server options for a widget
			// no default for main section views
			start : koStartUnixTime,
			end : koEndUnixTime
		};

		// When a user changes filtered dates - reload monitoring records
		this.mntrUnixTimeBorder.start.subscribe(this.loadFilteredListOfMonitoringRecord, this);
		this.mntrUnixTimeBorder.end.subscribe(this.loadFilteredListOfMonitoringRecord, this);

		//{ #region GRAPH

		/**
		 * Computed array from the time border object
		 */
		this.timeBorderArr = ko.computed({
				read : this.getTimeBorderArr,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Min and max values of curves
		 * @type {Array}
		 */
		this.valueBorderArr = ko.computed({
				read : mntrHelper.getValueBorderArr.bind(null, this.mdlWell.listOfMonitoringRecord),
				deferEvaluation : true,
				owner : this
			});

		/**
		 * List of viewmodels of params (for different views/widgets - need an IsVisible property)
		 * @type {Array.<module:viewmodels/wfm-parameter-of-wroup>}
		 */
		this.listOfMonitoredVwmParams = ko.computed({
				read : this.getListOfMonitoredVwmParams,
				deferEvaluation : true,
				owner : this
			}).trackHasItems();

		/**
		 * Array with properties for svg paths
		 * @type {Array.<object>}
		 */
		this.pathsArr = ko.computed({
				read : this.getPathsArr,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Main object for graph
		 */
		this.mntrGraph = new SvgGraph(this.timeBorderArr, this.valueBorderArr, this.pathsArr);

		//} #endregion GRAPH

		// // Load data (widget or main view options)
		// // Automatically will be loaded monitoring records for these dates
		// this.mntrUnixTimeBorder.start(optStartUnixTime);
		// this.mntrUnixTimeBorder.end(optEndUnixTime);
	};

	/**
	 * Load the list, using filtered dates (if both exists)
	 */
	exports.prototype.loadFilteredListOfMonitoringRecord = function () {
		console.log('load monitoring');
		var tmpTime = this.mntrUnixTimeBorder;
		var startUnixTime = ko.unwrap(tmpTime.start);
		if (startUnixTime) {
			var endUnixTime = ko.unwrap(tmpTime.end);
			if (endUnixTime) {
				this.mdlWell.loadListOfMonitoringRecord(startUnixTime, endUnixTime);
			}
		}
	};

	/**
	 * Get the time border
	 * @returns {Array} - [min, max] time values
	 */
	exports.prototype.getTimeBorderArr = function () {
		return [ko.unwrap(this.mntrUnixTimeBorder.start), ko.unwrap(this.mntrUnixTimeBorder.end)];
	};

	/**
	 * Get list of viewmodels of monitored parameters
	 * @returns {Array.<module:viewmodels/wfm-parameter-of-wroup>}
	 */
	exports.prototype.getListOfMonitoredVwmParams = function () {
		var tmpList = ko.unwrap(this.mdlWell.getWellGroup().listOfMonitoredParams);
		return tmpList.map(function (paramItem) {
			return new VwmWfmParameterOfWroup(paramItem);
		});
	};

	/**
	 * Remove all records: ovveride the model method with a confirmation and checking
	 */
	exports.prototype.removeAllMonitoringRecords = function () {
		if (confirm('Are you sure you want to delete all records for this well for all time?')) {
			this.mdlWell.removeAllMonitoringRecords();
		}
	};

	/**
	 * Get the array of svg paths
	 */
	exports.prototype.getPathsArr = function () {
		// Redraw data after changing a graph zoom
		var tmpZoomTransform = ko.unwrap(this.mntrGraph.zoomTransform);

		// Without zoom initization - do not redraw
		if (tmpZoomTransform) {
			var listOfVwmParam = ko.unwrap(this.listOfMonitoredVwmParams);

			var tmpXScale = ko.unwrap(this.mntrGraph.scaleX),
			tmpYScale = ko.unwrap(this.mntrGraph.scaleY);

			if (tmpXScale && tmpYScale) {
				// Monitoring records for all dates
				var tmpRecords = ko.unwrap(this.mdlWell.sortedListOfMonitoringRecord);

				return listOfVwmParam.map(mntrHelper.genFromParam.bind(null, tmpRecords, tmpXScale, tmpYScale));
			}
		}

		return [];
	};

	return exports;
});
