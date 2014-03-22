/** @module */
define([], function () {
	'use strict';

	/**
	 * Enum for stages 
   *    id == key to use without strings, only by keys, like: stageConstants[stageKey]
	 * @readonly
	 * @enum {Object.<string, string>}
	 */
	var exports = {
		/** User profile */
		upro : {
			id : 'upro',
			single : 'user-profile',
			plural : 'user-profiles'
		},
		/** Company */
		company : {
			id : 'company',
			single : 'company',
			plural : 'companies'
		},
		/** Well region */
		wegion : {
			id : 'wegion',
			single : 'well-region',
			plural : 'well-regions'
		},
		/** Well field */
		wield : {
			id : 'wield',
			single : 'well-field',
			plural : 'well-fields'
		},
		/** Well group (platform) */
		wroup : {
			id : 'wroup',
			single : 'well-group',
			plural : 'well-groups'
		},
		/** Well */
		well : {
			id : 'well',
			single : 'well',
			plural : 'wells',
      ptrn: {
        'summary': 'well-summary',
        'map': 'well-map',
        'perfomance': 'well-perfomance'
      }
		}
	};

	return exports;
});
