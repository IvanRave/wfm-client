/** @module */
define(['knockout',
		'helpers/app-helper',
		'viewmodels/widget'],
	function (ko,
		appHelper,
		VwmWidget) {
	'use strict';

	/**
	 * Widget for summary info: for all stages
	 * @constructor
	 * @augments {module:viewmodels/widget}
	 */
	var exports = function (mdlWidget, opts, propSpecList) {
		VwmWidget.call(this, mdlWidget);
    
		var ths = this;
    
    /**
    * Property's specifications
    */
    this.propSpecList = propSpecList;
    
		opts = opts || {};

		this.propSpecList.forEach(function (propSpec) {
			// Properties without type not needed
			if (propSpec.tpe) {
				ths['isVis' + propSpec.clientId] = ko.observable(opts['IsVis' + propSpec.serverId]);
			}
		});
	};

  /** Inherit from a widget viewmodel */
	appHelper.inherits(exports, VwmWidget);

  /**
  * Convert to the option string
  */
	exports.prototype.toStringifyOpts = function () {
		var ths = this;
		var obj = {};

		this.propSpecList.forEach(function (propSpec) {
			if (propSpec.tpe) {
				obj['IsVis' + propSpec.serverId] = ko.unwrap(ths['isVis' + propSpec.clientId]);
			}
		});

		return JSON.stringify(obj);
	};

	return exports;
});
