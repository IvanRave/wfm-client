/** @module */
define([], function () {
	'use strict';

	/**
	 * Enum for stage views
	 * @readonly
	 * @enum {Object.<string, string>}
	 */
	var exports = {
    /** Dashboard view */
		dashboard : {
			id : 'dashboard',
			name : 'Dashboard'
		},
    /** File manager view */
		fmgr : {
			id : 'fmgr',
			name : 'File manager'
		}
    // /** Any section view */
		// section : {
			// id : 'section',
			// name : 'Section'
		// }
	};

	return exports;
});
