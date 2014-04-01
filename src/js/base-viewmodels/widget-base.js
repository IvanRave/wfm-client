/** @module */
define(['knockout'], function (ko) {
	'use strict';

	/**
	 * Viewmodel: a base viewmodel for widgets
	 * @constructor
	 */
	var exports = function (mdlWidget) {
		/**
		 * Model: widget
		 * @type {module:base-models/widget-base}
		 */
		this.mdlWidget = mdlWidget;

		/**
		 * Whether the setting panel is visible
		 * @type {boolean}
		 */
		this.isVisSettingPanel = ko.observable(false);
	};

	/** Save model through viewmodel */
	exports.prototype.saveVwmWidget = function () {
		this.mdlWidget.putWidget(this.hideVisSettingPanel.bind(this));
	};

	/** Hide a setting panel */
	exports.prototype.hideVisSettingPanel = function () {
		this.isVisSettingPanel(false);
	};

	/** Show setting panel */
	exports.prototype.showVisSettingPanel = function () {
		this.isVisSettingPanel(true);
	};

	return exports;
});
