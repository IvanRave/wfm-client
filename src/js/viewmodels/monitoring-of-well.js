/** @module */
define(['jquery',
		'knockout',
		'viewmodels/svg-graph',
		'd3',
		'viewmodels/wfm-parameter-of-wroup'],
	function ($,
		ko,
		SvgGraph,
		d3,
		VwmWfmParameterOfWroup) {
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
				read : this.getValueBorderArr,
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
	 * Get a value border array
	 * @returns {Array} - [min, max] values
	 */
	exports.prototype.getValueBorderArr = function () {
		var minVal = null,
		maxVal = null;

		var tmpRecords = ko.unwrap(this.mdlWell.listOfMonitoringRecord);

		tmpRecords.forEach(function (tmpRecord) {
			var tmpDict = tmpRecord.dict;
			for (var paramKey in tmpDict) {
				if (tmpDict.hasOwnProperty(paramKey)) {
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
			}
		});

		// Elements of this array can be null
		return [minVal, maxVal];
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
		if (confirm('{{capitalizeFirst lang.confirmToDelete}} all records for this well for all time?')) {
			this.mdlWell.removeAllMonitoringRecords();
		}
	};

	/**
	 * Get the array of svg paths
	 */
	exports.prototype.getPathsArr = function () {
		var resultArr = [];

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

				listOfVwmParam.forEach(function (vwmParamItem) {
					// parameter id, like CSG, WaterRate ...
					var tmpIdOfParameter = vwmParamItem.mdlWfmParameterOfWroup.wfmParameterId;

					/**
					 * Create line with d3 lib
					 *    https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-line
					 */
					var generateLinePath = d3.svg.line()
						.interpolate('monotone') // monotone or linear
						.x(function (d) {
							return tmpXScale(new Date(ko.unwrap(d.unixTime) * 1000));
						})
						.y(function (d) {
							return tmpYScale(
								$.isNumeric(ko.unwrap(d.dict[tmpIdOfParameter])) ? (ko.unwrap(d.dict[tmpIdOfParameter]) * ko.unwrap(ko.unwrap(vwmParamItem.mdlWfmParameterOfWroup.wfmParameter).uomCoef)) : null);
						});

					resultArr.push({
						prmPath : generateLinePath(tmpRecords),
						prmStroke : ko.unwrap(vwmParamItem.mdlWfmParameterOfWroup.color),
						prmVisible : ko.unwrap(vwmParamItem.isVisible)
					});
				});
			}
		}

		return resultArr;
	};

	return exports;
});
