/**
 * @module
 * @todo #22! fix a changing a name of a layout
 */
define(['knockout',
		'models/widgock',
		'services/widgout',
		'services/report'], function (ko,
		Widgock,
		widgoutService,
		reportService) {
	'use strict';

	/** Import widget block list to layout */
	function importWidgocks(data, widgoutItem) {
		return (data || []).map(function (item) {
			return new Widgock(item, widgoutItem);
		});
	}

	/**
	 * Widget layout
	 * @constructor
	 */
	var exports = function (data, parent) {
		data = data || {};

		/**
		 * Getter for a parent stage (well, group, field... )
		 * @returns {module:base-models/stage-base}
		 */
		this.getParent = function () {
			return parent;
		};

		/**
		 * Layout id (guid)
		 * @type {string}
		 */
		this.id = data.Id;

		/**
		 * A name of the layout
		 * @type {string}
		 */
		this.name = ko.observable(data.Name);

		// Save, when a name is changed */
		this.name.subscribe(this.save);

		/**
		 * Well widget block list
		 * @type {Array.<module:models/widgock>}
		 */
		this.widgocks = ko.observableArray(importWidgocks(data.WidgockDtoList, this));
	};

	/** Save a layout */
	exports.prototype.save = function () {
		// Get well id as parent
		var tmpStageId = this.getParent().Id || this.getParent().id;

		widgoutService.put(this.getParent().stageKey, tmpStageId, this.id, {
			id : this.id,
			name : ko.unwrap(this.name)
		});
	};

	/** Post a request */
	exports.prototype.postReport = function (nameOfReport, scsCallback, errCallback) {
		reportService.post(this.id, nameOfReport).done(scsCallback).fail(errCallback);
	};

	return exports;
});
