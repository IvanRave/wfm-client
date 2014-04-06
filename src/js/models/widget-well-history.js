/** @module */
define(['knockout',
		'helpers/app-helper',
		'base-models/widget-base'],
	function (ko,
		appHelper,
		Widget) {
	'use strict';

	/**
	 * History widget with date filter, asc or desc
	 * @constructor
	 * @augments {module:base-models/widget-base}
	 */
	var exports = function (data, widgockItem) {
		Widget.call(this, data, widgockItem);

		var tmpOpts = JSON.parse(data.Opts);

		/**
		 * Widget options
		 * @enum {Object.<string, Object>}
		 */
		this.opts = {
			/**
			 * Start unix time
			 * @type {number}
			 */
			startDate : ko.observable(tmpOpts['startDate']),
			/**
			 * End unix time
			 * @type {number}
			 */
			endDate : ko.observable(tmpOpts['endDate']),
			/**
			 * Filtered id of job type
			 * @type {string}
			 */
			jobTypeId : ko.observable(tmpOpts['jobTypeId']),
			/**
			 * A sort order (1 or -1), by default -1 (from newer to older)
			 * @type {number}
			 */
			sortByDateOrder : ko.observable(tmpOpts['sortByDateOrder'] || -1)
		};
	};

	/** Inherit from a widget model */
	appHelper.inherits(exports, Widget);

	/** Convert to string */
	exports.prototype.toPlainOpts = function () {
		return ko.toJSON(this.opts);
	};

	return exports;
});
