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
	var exports = function (mdlWidget) {
    //, parentVwmStage
		VwmWidget.call(this, mdlWidget);

    // parentVwmStage may be is not a Well Stage, -> set to null (first argument)
    // VwmStage need only for id of selected fmg section (to add files of parts of an image)
		this.vwmScopeOfHistoryOfWell = new VwmScopeOfHistoryOfWell(null,
        mdlWidget.mdlStageContext,
				mdlWidget.opts.startDate,
				mdlWidget.opts.endDate,
				mdlWidget.opts.jobTypeId,
				mdlWidget.opts.sortByDateOrder);
	};

	/** Inherit from a widget viewmodel */
	appHelper.inherits(exports, VwmWidget);

	return exports;
});
