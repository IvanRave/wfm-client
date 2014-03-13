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

    /**
    * A transform attribute
    *    two parameters in one observable object, to don't repeat redrawing, 
    *    when both params are updated
    * @type {Object}
    */
		this.opts.transform = ko.observable({
				scale : tmpOpts.transform ? (tmpOpts.transform.scale || 1) : 1,
				translate : tmpOpts.transform ? (tmpOpts.transform.translate || [0, 0]) : [0, 0]
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
    return ko.toJSON(this.opts);
	};
  
  /**
	 * Get a dictionary for a select box (select map)
	 */
	exports.prototype.getDictOfMap = function () {
    var allMaps = ko.unwrap(this.getWidgock().getWidgout().getParent().WellFieldMaps);
		return allMaps.map(function (elem) {
			return {
        optValue : ko.unwrap(elem.id),
				optText : ko.unwrap(elem.name)
			};
		});
	};

	return exports;
});
