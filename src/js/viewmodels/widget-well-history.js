/** @module */
define(['knockout',
		'viewmodels/scope-of-history-of-well',
		'helpers/app-helper',
		'base-viewmodels/widget-base'],
	function (ko,
		VwmScopeOfHistoryOfWell,
		appHelper,
		VwmWidget) {
	'use strict';

	/**
	 * History widget with date filter, asc or desc
	 * @constructor
	 * @augments {module:base-viewmodels/widget-base}
	 */
	var exports = function (mdlWidget, vwmWell) {
		VwmWidget.call(this, mdlWidget);

		this.vwmScopeOfHistoryOfWell = new VwmScopeOfHistoryOfWell(vwmWell,
				mdlWidget.opts.startDate,
				mdlWidget.opts.endDate,
				mdlWidget.opts.jobTypeId,
				mdlWidget.opts.sortByDateOrder);
	};

	/** Inherit from a widget viewmodel */
	appHelper.inherits(exports, VwmWidget);

	return exports;
});
