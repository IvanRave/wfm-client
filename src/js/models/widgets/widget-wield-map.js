/** @module */
define(['knockout',
		'helpers/app-helper',
		'models/widget'],
	function (ko,
		appHelper,
		Widget) {
	'use strict';

	/**
	 * Base: widget model for map of well field
	 * @constuctor
	 * @augments {module:models/widget}
	 */
	var exports = function (data, widgockItem) {
		Widget.call(this, data, widgockItem);

		var tmpOpts = JSON.parse(data.Opts);

		/**
		 * Model id of selected map viewmodel
		 */
		this.opts.idOfSlcMapOfWield = ko.observable(tmpOpts['idOfSlcMapOfWield']);

		/** Whether the name of a map is visible */
		this.opts.isVisName = ko.observable(tmpOpts['isVisName']);

		/** Whether map is visible */
		this.opts.isVisImg = ko.observable(tmpOpts['isVisImg']);

		this.opts.transform = ko.observable({
				scale : tmpOpts['transformScale'] || 1,
				translate : tmpOpts['transformTranslate'] || [0, 0]
			});

		/**
		 * Dictionary for select box (value, text) with maps
		 */
		this.dictOfMap = ko.computed({
				read : this.getDictOfMap,
				deferEvaluation : true,
				owner : this
			});
	};

	/** Inherit from a widget model */
	appHelper.inherits(exports, Widget);

	/** Convert to plain JSON to send to the server as widget settings */
	exports.prototype.toPlainOpts = function () {
		return JSON.stringify({
			'idOfSlcMapOfWield' : ko.unwrap(this.opts.idOfSlcMapOfWield),
			'isVisName' : ko.unwrap(this.opts.isVisName),
			'isVisImg' : ko.unwrap(this.opts.isVisImg),
			'transformScale' : ko.unwrap(this.opts.transform).scale,
			'transformTranslate' : ko.unwrap(this.opts.transform).translate
		});
	};
  
  /**
	 * Get a dictionary for a select box (select map)
	 */
	exports.prototype.getDictOfMap = function () {
    var allMaps = ko.unwrap(this.getWidgock().getWidgout().getParent().WellFieldMaps);
		return allMaps.map(function (elem) {
			return {
				optText : ko.unwrap(elem.name),
				optValue : ko.unwrap(elem.id)
			};
		});
	};

	return exports;
});
