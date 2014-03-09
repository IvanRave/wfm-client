/** @module */
define(['knockout',
		'helpers/app-helper',
		'models/widget'],
	function (ko,
		appHelper,
		Widget) {
	'use strict';

	/**
	 * A perfomance widget
	 * @constructor
	 * @augments {module:models/widget}
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
    
		this.opts.startYear = ko.observable(tmpOpts['StartYear']);
		this.opts.endYear = ko.observable(tmpOpts['EndYear']);
		this.opts.startMonth = ko.observable(tmpOpts['StartMonth']);
		this.opts.endMonth = ko.observable(tmpOpts['EndMonth']);
		this.opts.selectedAttrGroupId = ko.observable(tmpOpts['SelectedAttrGroupId']);
		this.opts.isVisibleForecastData = ko.observable(tmpOpts['IsVisibleForecastData']);
	};

	/** Inherit from a widget model */
	appHelper.inherits(exports, Widget);

	/** Convert to string */
	exports.prototype.toPlainOpts = function () {
    return ko.toJSON(this.opts);
		// return JSON.stringify({
      // 'StartYear' : ko.unwrap(this.startYear),
			// 'EndYear' : ko.unwrap(this.endYear),
      // 'StartMonth' : ko.unwrap(this.startMonth),
			// 'EndMonth' : ko.unwrap(this.endMonth),
      // 'SelectedAttrGroupId' : ko.unwrap(this.selectedAttrGroupId),
      // 'IsVisibleForecastData' : ko.unwrap(this.isVisibleForecastData)
		// });
	};

	return exports;
});
