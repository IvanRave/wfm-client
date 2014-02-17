/** @module */
define(['helpers/ajax-request'], function (ajaxRequest) {
	'use strict';

  var url = function (idOfWell, idOfWfmParameter) {
     return '{{conf.requrl}}/api/wells/' + idOfWell +'/procent-borders' + (idOfWfmParameter ? ('/' + idOfWfmParameter) : '');
  };
  
	/**
	 * Model: procent border service
	 * @constructor
	 */
	var exports = {
    get: function(idOfWell){
      return ajaxRequest('GET', url(idOfWell));
    },
    insertOrUpdate: function(idOfWell){
      return ajaxRequest('POST', url(idOfWell));
    },
    remove: function(idOfWell, idOfWfmParameter){
      return ajaxRequest('DELETE', url(idOfWell, idOfWfmParameter));
    }
  };

	return exports;
});
