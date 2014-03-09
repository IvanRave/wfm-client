/** @module */
define(['knockout',
		'helpers/app-helper',
		'models/widget'],
	function (ko,
		appHelper,
		Widget) {
	'use strict';

	/**
	 * Widget for summary info: for all stages
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

    /** All summary properties for current stage */
    var propSpecList = widgockItem.getWidgout().getParent().propSpecList;
    
		/**
		 * Fill properties
		 */
		propSpecList.forEach(function (propSpec) {
			// Properties without type not needed
			if (propSpec.tpe) {
				this.opts['isVis' + propSpec.serverId] = ko.observable(tmpOpts['isVis' + propSpec.serverId]);
			}
		}, this);
	};

	/** Inherit from a widget model */
	appHelper.inherits(exports, Widget);

	/**
	 * Convert to the option string
	 */
	exports.prototype.toPlainOpts = function () {
		return ko.toJSON(this.opts);
	};

	return exports;
});
