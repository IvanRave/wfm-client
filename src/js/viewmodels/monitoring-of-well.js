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
	var exports = function (mdlWell, koListOfMonitoredParams, optKoStartUnixTime, optKoEndUnixTime) {
		/** Alternative */
		var ths = this;

		/**
		 * A date border to filter monitoring data
		 * @type {object}
		 */
		this.mntrUnixTimeBorder = {
			// By default: loaded from server options for a widget
			// no default for main section views
			start : optKoStartUnixTime || ko.observable(),
			end : optKoEndUnixTime || ko.observable()
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
		 * List of viewmodels of params (for different views/widgets - need an IsVisible property)
		 * @type {Array.<module:viewmodels/wfm-parameter-of-wroup>}
		 */
		this.listOfMonitoredVwmParams = ko.computed({
				read : function () {
					return ko.unwrap(koListOfMonitoredParams).map(function (paramItem) {
						return new VwmWfmParameterOfWroup(paramItem);
					});
				},
				deferEvaluation : true
			}).trackHasItems();

		/**
		 * Remove all records: ovveride the model method with a confirmation and checking
		 */
		this.removeAllMonitoringRecords = function () {
			if (confirm('{{capitalizeFirst lang.confirmToDelete}} all records for this well for all time?')) {
				mdlWell.removeAllMonitoringRecords();
			}
		};

		/**
		 * Array with properties for svg paths
		 * @type {Array.<object>}
		 */
		this.pathsArr = ko.computed({
				read : function () {
					var resultArr = [];

					// Redraw data after changing a graph zoom
					var tmpZoomTransform = ko.unwrap(ths.mntrGraph.zoomTransform);

					// Without zoom initization - do not redraw
					if (tmpZoomTransform) {

						var listOfVwmParam = ko.unwrap(ths.listOfMonitoredVwmParams);

						var tmpXScale = ko.unwrap(ths.mntrGraph.scaleObj.x),
						tmpYScale = ko.unwrap(ths.mntrGraph.scaleObj.y);

						if (tmpXScale && tmpYScale) {

							// Monitoring records for all dates
							var tmpRecords = ko.unwrap(mdlWell.sortedListOfMonitoringRecord);

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
				},
				deferEvaluation : true
			});

		/**
		 * Main object for graph
		 */
		this.mntrGraph = new SvgGraph(ths.timeBorderArr, ths.valueBorderArr, ths.pathsArr);

		//} #endregion GRAPH

		// // Load data (widget or main view options)
		// // Automatically will be loaded monitoring records for these dates
		// this.mntrUnixTimeBorder.start(optStartUnixTime);
		// this.mntrUnixTimeBorder.end(optEndUnixTime);
	};

	return exports;
});
