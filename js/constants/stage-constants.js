define(function (require, exports, module) {
/** @module constants/stage-constants */

'use strict';

/**
 * Enum for stages
 *    id == key to use without strings, only by keys, like: stageConstants[stageKey]
 *    Please use this class in wfm-node and wfm-client
 * @readonly
 * @enum {Object.<string, string>}
 */
exports = {
	/** User profile */
	upro : {
		id : 'upro',
		single : 'user-profile',
		plural : 'user-profiles',
		ptrn : {}
	},
	/** Company */
	company : {
		id : 'company',
		single : 'company',
		plural : 'companies',
		ptrn : {
			summary : 'company-summary'
		}
	},
	/** Well region */
	wegion : {
		id : 'wegion',
		single : 'well-region',
		plural : 'well-regions',
		ptrn : {
			summary : 'wegion-summary'
		}
	},
	/** Well field */
	wield : {
		id : 'wield',
		single : 'well-field',
		plural : 'well-fields',
		ptrn : {
			summary : 'wield-summary',
			map : 'wield-map',
			stat : 'wield-stat'
		}
	},
	/** Well group (platform) */
	wroup : {
		id : 'wroup',
		single : 'well-group',
		plural : 'well-groups',
		ptrn : {
			summary : 'wroup-summary'
		}
	},
	/** Well */
	well : {
		id : 'well',
		single : 'well',
		plural : 'wells',
		ptrn : {
			summary : 'well-summary',
			map : 'well-map',
			perfomance : 'well-perfomance',
			sketch : 'well-sketch',
			volume : 'well-volume',
			history : 'well-history',
			monitoring : 'well-monitoring',
			integrity : 'well-integrity',
			log : 'well-log',
			test : 'well-test',
			nodalAnalysis : 'well-nodalanalysis'
		}
	}
};

module.exports = exports;

});