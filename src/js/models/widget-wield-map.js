﻿/** @module */
define(['knockout',
		'helpers/app-helper',
		'base-models/widget-base'],
	function (ko,
		appHelper,
		Widget) {
	'use strict';

	/**
	 * Base: widget model for map of well field
	 * @constuctor
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
			 * Model id of selected map viewmodel
			 */
			idOfSlcMapOfWield : ko.observable(tmpOpts['idOfSlcMapOfWield']),
			/**
			 * Whether the name of a map is visible
			 * @type {boolean}
			 */
			isVisName : ko.observable(tmpOpts['isVisName']),
			/**
			 * Whether the map is visible
			 * @type {boolean}
			 */
			isVisImg : ko.observable(tmpOpts['isVisImg']),
			/**
			 * A transform attribute
			 *    two parameters in one observable object, to don't repeat redrawing,
			 *    when both params are updated
			 * @type {Object}
			 */
			transform : ko.observable({
				scale : tmpOpts.transform ? (tmpOpts.transform.scale || 1) : 1,
				translate : tmpOpts.transform ? (tmpOpts.transform.translate || [0, 0]) : [0, 0]
			})
		};

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
		// getWidgock().getWidgout().getParent()
		console.log('mdl stage context from dict of map', this.mdlStageContext);
		var allMaps = ko.unwrap(this.mdlStageContext.WellFieldMaps);
		return allMaps.map(function (elem) {
			return {
				optValue : ko.unwrap(elem.id),
				optText : ko.unwrap(elem.name)
			};
		});
	};

	return exports;
});
