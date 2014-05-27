/** @module */
define(['knockout',
		'helpers/app-helper',
		'base-models/widget-base'],
	function (ko,
		appHelper,
		Widget) {
	'use strict';

	/**
	 * Widget for summary info: for all stages
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
		this.tmpOpts = JSON.parse(data.Opts);

		/**
		 * All summary properties for current stage
		 * @todo #24! Possible error:
		 *       Cannot read property 'propSpecList' of undefined
     *       Error occurs, during loading application, 
     *       if user click to the dashboard before loading is finished
		 */
		var propSpecList = this.mdlStageContext.propSpecList;

		/**
		 * Widget options: 'IsVis' + stage property
		 * @enum {Object.<string, Object>}
		 */
		this.opts = {};

		/**
		 * Fill properties
		 */
		propSpecList.forEach(this.setPropSpec, this);
	};

	/** Inherit from a widget model */
	appHelper.inherits(exports, Widget);

	/**
	 * Set prop specs for a summary
	 */
	exports.prototype.setPropSpec = function (propSpec) {
		// Properties without type not needed, like a helpfull prop for a company logo
		if (propSpec.tpe) {
			this.opts['isVis' + propSpec.serverId] = ko.observable(this.tmpOpts['isVis' + propSpec.serverId]);
		}
	};

	/**
	 * Convert to the option string
	 */
	exports.prototype.toPlainOpts = function () {
		return ko.toJSON(this.opts);
	};

	return exports;
});
