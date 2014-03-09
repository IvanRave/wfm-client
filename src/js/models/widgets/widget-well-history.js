/** @module */
define(['knockout',
		'helpers/app-helper',
		'models/widget'],
	function (ko,
		appHelper,
		Widget) {
	'use strict';

	/**
	 * History widget with date filter, asc or desc
	 * @constructor
	 * @augments {module:models/widget}
	 */
	var exports = function (data, widgockItem) {
		Widget.call(this, data, widgockItem);

		var tmpOpts = JSON.parse(data.Opts);

		this.opts.startDate = ko.observable(tmpOpts['startDate']);
		this.opts.endDate = ko.observable(tmpOpts['endDate']);
		this.opts.jobTypeId = ko.observable(tmpOpts['jobTypeId']);

		/**
		 * A sort order (1 or -1), by default -1 (from newer to older)
		 * @type {number}
		 */
		this.opts.sortByDateOrder = ko.observable(tmpOpts['sortByDateOrder'] || -1);
	};

	/** Inherit from a widget model */
	appHelper.inherits(exports, Widget);

	/** Convert to string */
	exports.prototype.toPlainOpts = function () {
		return ko.toJSON(this.opts);
	};

	return exports;
});
