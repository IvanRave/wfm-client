/** @module */
define(['knockout',
		'helpers/app-helper',
		'base-models/widget-base'],
	function (ko,
		appHelper,
		Widget) {
	'use strict';

	/**
	 * A perfomance widget
	 * @constructor
	 * @augments {module:base-models/widget-base}
	 */
	var exports = function (data, widgockItem) {
		Widget.call(this, data, widgockItem);

		/**
		 * Options for widget, like {isVisName: true, ...}
		 *    data.Opts cannot be null or undefined
		 *    it is a temporary string for a quick access to set observable parameters
		 * @type {Object}
		 */
		var tmpOpts = JSON.parse(data.Opts);

		/**
		 * Widget options
		 * @enum {Object.<string, Object>}
		 */
		this.opts = {
			/**
			 * Filter: start year
			 * @type {number}
			 */
			startYear : ko.observable(tmpOpts['startYear']),
			/**
			 * Filter: end year
			 * @type {number}
			 */
			endYear : ko.observable(tmpOpts['endYear']),
      /**
			 * Filter: start month
			 * @type {number}
			 */
			startMonth : ko.observable(tmpOpts['startMonth']),
      /**
			 * Filter: end month
			 * @type {number}
			 */
			endMonth : ko.observable(tmpOpts['endMonth']),
      /**
			 * Filter: selected squad of params
			 * @type {string}
			 */
			selectedAttrGroupId : ko.observable(tmpOpts['selectedAttrGroupId']),
      /**
			 * Whether the forecast is visible
			 * @type {boolean}
			 */
			isVisibleForecastData : ko.observable(tmpOpts['isVisibleForecastData'])
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
