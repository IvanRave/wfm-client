/**
 * @module
 * @todo: feat: add name of well #ML!
 * @todo: feat: make selected marker lighter #LL!
 * @todo: feat: main info by click #MM!
 *              - Cummulative Oil (Накопленная добыча)
 *              - Drilling year
 *              - Production rate
 *              - Water cut %
 */
define(['knockout'], function (ko) {
	'use strict';

	/**
	 * Viewmodel: well marker (in map of field)
	 * @constructor
	 */
	var exports = function (mdlWellMarker, koSlcVwmWellMarker, vwmMapOfWield) {
		/**
		 * Model: well marker
		 * @type {module:models/well-marker-of-map-of-wield}
		 */
		this.mdlWellMarker = mdlWellMarker;

    /** Getter for a map */
    this.getVwmMapOfWield = function(){
      return vwmMapOfWield;
    };
    
		/**
		 * Whether well marker is selected
		 * @type {boolean}
		 */
		this.isSlc = ko.computed({
				read : function () {
					return this === ko.unwrap(koSlcVwmWellMarker);
				},
				deferEvaluation : true,
        owner: this
			});
	};
  
	return exports;
});
