/** @module */
define(['knockout'], function (ko) {
	'use strict';

	/**
	 * Viewmodel: widget
	 * @constructor
	 */
	var exports = function (mdlWidget) {
		/**
		 * Model: widget
		 * @type {module:models/widget}
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
		var ths = this;
		this.mdlWidget.putWidget(function () {
			// Close settings after saving
			ths.isVisSettingPanel(false);
		});
	};

	/** Show setting panel */
	exports.prototype.showVisSettingPanel = function () {
		this.isVisSettingPanel(true);
	};

	return exports;
});
