/** @module */
define(['knockout',
		'viewmodels/scope-of-history-of-well',
		'helpers/app-helper',
		'viewmodels/widget'],
	function (ko,
		VwmScopeOfHistoryOfWell,
		appHelper,
		VwmWidget) {
	'use strict';

	/**
	 * History widget with date filter, asc or desc
	 * @constructor
	 * @augments {module:viewmodels/widget}
	 */
	var exports = function (mdlWidget, opts, vwmWell) {
		VwmWidget.call(this, mdlWidget);

		opts = opts || {};

		this.vwmScopeOfHistoryOfWell = new VwmScopeOfHistoryOfWell(opts, vwmWell);
	};

  /** Inherit from a widget viewmodel */
	appHelper.inherits(exports, VwmWidget);
  
  /** Convert to string */
  exports.prototype.toStringifyOpts = function () {
			return JSON.stringify({
				'StartDate' : ko.unwrap(this.vwmScopeOfHistoryOfWell['startDate']),
				'EndDate' : ko.unwrap(this.vwmScopeOfHistoryOfWell['endDate']),
				'SortByDateOrder' : ko.unwrap(this.vwmScopeOfHistoryOfWell['sortByDateOrder']),
				'JobTypeId' : ko.unwrap(this.vwmScopeOfHistoryOfWell['jobTypeId'])
			});
		};
  
	return exports;
});
