/** @module */
define(['knockout',
		'viewmodels/monitoring-of-well',
		'helpers/app-helper',
		'viewmodels/widget'],
	function (ko,
		VwmMonitoringOfWell,
		appHelper,
		VwmWidget) {
	'use strict';

	/**
	 * A monitoring widget
	 * @constructor
	 * @augments {module:viewmodels/widget}
	 */
	var exports = function (mdlWidget, opts, mdlWell, koListOfMonitoredParams) {
		VwmWidget.call(this, mdlWidget);

		opts = opts || {};

		this.widgetVwmMonitoringOfWell = new VwmMonitoringOfWell(opts, mdlWell, koListOfMonitoredParams);
	};

	/** Inherit from a widget viewmodel */
	appHelper.inherits(exports, VwmWidget);

	/**
	 * Convert to JSON string to save options on the server
	 */
	exports.prototype.toStringifyOpts = function () {
		return JSON.stringify({
			'StartUnixTime' : ko.unwrap(this.widgetVwmMonitoringOfWell.mntrUnixTimeBorder.start),
			'EndUnixTime' : ko.unwrap(this.widgetVwmMonitoringOfWell.mntrUnixTimeBorder.end)
		});
	};

	return exports;
});
