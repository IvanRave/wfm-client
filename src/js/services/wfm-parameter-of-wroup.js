/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
	'use strict';

	/**
	 * Generate url for service
	 */
	var url = function (idOfWroup, idOfWfmParameter) {
		// [RoutePrefix("api/well-groups/{idOfWroup:int}/wfm-parameters")]
		return '{{conf.requrl}}/api/well-groups/' + idOfWroup + '/wfm-parameters' + (idOfWfmParameter ? ('/' + idOfWfmParameter) : '');
	};

	/**
	 * Data service: parameters of well group
	 * @constructor
	 */
	var exports = {
		get : function (idOfWroup, idOfWfmParameter) {
			return ajaxRequest('GET', url(idOfWroup, idOfWfmParameter));
			// return [{
			// WellGroupId: 123,
			// WfmParameterId: 'GasRate',
			// Color: ...
		},
		post : function (idOfWroup, mdlData) {
			return ajaxRequest('POST', url(idOfWroup), mdlData);
		},
    // delete parameter from wellgroup
    // need to clean all data from TestData (and ProductionData)
    // if no one used this parameter (no more references to this table) and if parameter is not in the library 
    // then delete from wfmParameter table
		remove : function (idOfWroup, idOfWfmParameter) {
			return ajaxRequest('DELETE', url(idOfWroup, idOfWfmParameter));
		}
	};

	return exports;
});
