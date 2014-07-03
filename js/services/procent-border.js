/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
	'use strict';

	/**
	 * Url to get, post, delete procent borders for some well
	 */
	var url = function (idOfWell, idOfWfmParameter) {
		return '//wfm-report.herokuapp.com/api/wells/' + idOfWell + '/procent-borders' + (idOfWfmParameter ? ('/' + idOfWfmParameter) : '');
	};

	/**
	 * Url to get procent borders for all wells
	 */
	var urlForAllWells = function (idOfWroup) {
		return '//wfm-report.herokuapp.com/api/well-groups/' + idOfWroup + '/wells/all/procent-borders';
	};

	/**
	 * Model: procent border service
	 * @constructor
	 */
	var exports = {
    // Not used
    // More effectively to load all together using the GetForAllWell method
		get : function (idOfWell) {
			return ajaxRequest('GET', url(idOfWell));
		},
		insertOrUpdate : function (idOfWell, mdlData) {
			return ajaxRequest('POST', url(idOfWell), mdlData);
		},
		remove : function (idOfWell, idOfWfmParameter) {
			return ajaxRequest('DELETE', url(idOfWell, idOfWfmParameter));
		},
		getForAllWells : function (idOfWroup) {
			return ajaxRequest('GET', urlForAllWells(idOfWroup));
		}
	};

	return exports;
});
