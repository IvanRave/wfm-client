/** @module */
define(['knockout',
		'viewmodels/map-of-wield',
		'helpers/app-helper',
		'base-viewmodels/widget-base'],
	function (ko,
		VwmMapOfWield,
		appHelper,
		VwmWidget) {
	'use strict';

	/**
	 * Base: widget view model for map of well field
	 * @constuctor
	 * @augments {module:base-viewmodels/widget-base}
	 */
	var exports = function (mdlWidget) {
		VwmWidget.call(this, mdlWidget);

		/**
		 * Selected view map
     * @type {module:viewmodels/map-of-wield}
		 */
		this.slcVwmMapOfWield = ko.computed({
				read : this.getSlcVwmMapOfWield,
				deferEvaluation : true,
				owner : this
			});
	};

	/** Inherit from a widget viewmodel */
	appHelper.inherits(exports, VwmWidget);

	/**
	 * Get selected viewmodel of map of well field
	 */
	exports.prototype.getSlcVwmMapOfWield = function () {
		console.log('getSlcVwmMapOfWield has executed');
		var tmpVid = ko.unwrap(this.mdlWidget.opts.idOfSlcMapOfWield);
		if (tmpVid) {
      var allMaps = ko.unwrap(this.mdlWidget.getWidgock().getWidgout().getParent().WellFieldMaps);
      
			var needMapModel = allMaps.filter(function (elem) {
					return elem.id === tmpVid;
				})[0];

			if (needMapModel) {
				// TODO: #32! Set a transform option to the default value, 
        //            when a selected map is not equals the map from options
				// // if (needMapModel.id !== this.mdlWidget.widgetOpts['IdOfSlcMapOfWield']) {
					// // this.mdlWidget.opts.transform({
						// // scale : 1,
						// // translate : [0, 0]
					// // });
				// // }

				var needVwm = new VwmMapOfWield(needMapModel,
						this.mdlWidget.opts.idOfSlcMapOfWield,
						this.mdlWidget.opts.transform);

				return needVwm;
			}
		}
	};

	return exports;
});
