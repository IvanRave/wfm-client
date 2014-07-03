/** @module */
define(['constants/stage-constants', 'helpers/ajax-request'], function (stageConstants, ajaxRequest) {
	'use strict';

	/** Generate url */
	var url = function (stageKey, idOfSection, idOfFileSpec) {
		var stagePlural = stageConstants[stageKey].plural;
		return '//wfm-report.herokuapp.com/api/' + stagePlural + '/sections/' + idOfSection + '/file-specs' + (idOfFileSpec ? ('/' + idOfFileSpec) : '');
	};

	/**
	 * File spec service
	 * @constructor
	 */
	var exports = {
		// Get url for posting new file
		getUrl : function (stageKey, idOfSection, idOfFileSpec) {
			return url(stageKey, idOfSection, idOfFileSpec);
		},
		get : function (stageKey, idOfSection) {
			return ajaxRequest('GET', url(stageKey, idOfSection));
		},
		getColumnAttributes : function (stageKey, idOfSection, idOfFileSpec) {
			return ajaxRequest('GET', url(stageKey, idOfSection, idOfFileSpec) + '/column-attributes');
		},
		getPerfomanceFragment : function (stageKey, idOfSection, idOfFileSpec, indexOfStartRow, countOfRows) {
			return ajaxRequest('GET', url(stageKey, idOfSection, idOfFileSpec) + '/perfomance-fragment/' + indexOfStartRow + '/' + countOfRows);
		},
    postPerfomanceData: function(stageKey, idOfSection, idOfFileSpec, indexOfStartRow, listOfColumnAttrData){
      // {idOfFileSpec:guid}/perfomance-data/{indexOfStartRow:int}
      return ajaxRequest('POST', url(stageKey, idOfSection, idOfFileSpec) + '/perfomance-data/' + indexOfStartRow, listOfColumnAttrData);
    },
    put: function(stageKey, idOfSection, idOfFileSpec, mdlData){
      return ajaxRequest('PUT', url(stageKey, idOfSection, idOfFileSpec), mdlData);
    },
		// Delete few files in one request
		deleteArray : function (stageKey, idOfSection, listOfFileSpec) {
			return ajaxRequest('DELETE', url(stageKey, idOfSection), listOfFileSpec);
		}
	};

	return exports;
});
