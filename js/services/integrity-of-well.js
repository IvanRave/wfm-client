/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
	'use strict';

	/**
	 * Generate url for service
	 * @param {number} idOfWell - Id of parent (well)
	 * @param {string} idOfFileSpec - Id of file specification: guid
	 */
	var url = function (idOfWell, idOfFileSpec) {
		return '//wfm-report.herokuapp.com/api/wells/' + idOfWell + '/integrities' + (idOfFileSpec ? ('/' + idOfFileSpec) : '');
	};

	/**
	 * Data service: nodal analysis
	 * @constructor
	 */
	var exports = {
		get : function (idOfWell, idOfFileSpec) {
			return ajaxRequest('GET', url(idOfWell, idOfFileSpec));
		},
		post : function (idOfWell, data) {
			return ajaxRequest('POST', url(idOfWell), data);
		},
		put : function (idOfWell, idOfFileSpec, data) {
			return ajaxRequest('PUT', url(idOfWell, idOfFileSpec), data);
		},
		remove : function (idOfWell, idOfFileSpec) {
			return ajaxRequest('DELETE', url(idOfWell, idOfFileSpec));
		}
	};

	return exports;
});
