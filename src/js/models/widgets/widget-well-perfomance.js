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
    
		this.opts.startYear = ko.observable(tmpOpts['startYear']);
		this.opts.endYear = ko.observable(tmpOpts['endYear']);
		this.opts.startMonth = ko.observable(tmpOpts['startMonth']);
		this.opts.endMonth = ko.observable(tmpOpts['endMonth']);
		this.opts.selectedAttrGroupId = ko.observable(tmpOpts['selectedAttrGroupId']);
		this.opts.isVisibleForecastData = ko.observable(tmpOpts['isVisibleForecastData']);
	};

	/** Inherit from a widget model */
	appHelper.inherits(exports, Widget);

	/** Convert to string */
	exports.prototype.toPlainOpts = function () {
    return ko.toJSON(this.opts);
	};

	return exports;
});
