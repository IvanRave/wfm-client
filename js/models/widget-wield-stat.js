define(function (require, exports, module) {
/** @module models/widget-wield-stat */

'use strict';

var ko = require('knockout');
var appHelper = require('helpers/app-helper');
var Widget = require('base-models/widget-base');

/**
 * Base: widget model for statistics
 * @constuctor
 * @augments {module:base-models/widget-base}
 */
exports = function (data, widgockItem) {
	Widget.call(this, data, widgockItem);

	var tmpOpts = JSON.parse(data.Opts);

	/**
	 * Widget options
	 * @enum {Object.<string, Object>}
	 */
	this.opts = {
		/**
		 * Whether the active/non-active diagram is showed
		 * @type {boolean}
		 */
		isVisWellActivity : ko.observable(tmpOpts['isVisWellActivity']),
	};

	/**
	 * List of wells for statistics
	 */
	this.listOfWell = ko.computed({
			read : this.mdlStageContext.calcListOfWell.bind(this.mdlStageContext),
			deferEvaluation : true
		});

	this.wellActivityData = ko.computed({
			read : this.calcWellActivityData,
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

exports.prototype.calcWellActivityData = function () {
	var tmpListOfWell = ko.unwrap(this.listOfWell);

	var activeCount = 0,
	nonActiveCount = 0;

	tmpListOfWell.forEach(function (tmpWell) {
		if (ko.unwrap(tmpWell.IsActive)) {
			activeCount += 1;
		} else {
			nonActiveCount += 1;
		}
	});

	return [{
			lbl : activeCount || '',
			val : activeCount,
			name : 'Active wells',
			color : '#79a0c1' // Color from main.css $brand-primary
		}, {
			lbl : nonActiveCount || '',
			val : nonActiveCount,
			name : 'Non-active wells',
			color : '#999'
		}
	];
};

module.exports = exports;

});