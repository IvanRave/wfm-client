/** @module */
define(['jquery', 
  'knockout',
  'services/procent-border'], 
  function ($, 
  ko,
  procentBorderService) {
	'use strict';

	/**
	 * Model: procent border for a WFM parameter in every well
	 * @constructor
	 */
	var exports = function (data, wellItem) {
    data = data || {};
    
    /** Alternative */
    var ths = this;
    
    /**
    * Id of well (parent)
    * @type {number}
    */
    this.idOfWell = data.IdOfWell;
    
    /**
    * Id of wfm parameter
    * @type {string}
    */
    this.idOfWfmParameter = data.IdOfWfmParameter;
    
    /**
    * Procent value: 0 to 100%
    * @type {number}
    */
    this.procent = ko.observable(data.Procent);
    
    /**
    * Whether saving is in progress
    * @type {bool}
    */
    this.isSaveProgress = ko.observable(false);
    
    /**
    * Insert of update procent border
    */
    this.save = function(){
      ths.isSaveProgress(true);
      procentBorderService.insertOrUpdate(ths.idOfWell, {
        IdOfWell: ths.idOfWell,
        IdOfWfmParameter: ths.idOfWfmParameter,
        Procent: ko.unwrap(ths.procent)
      }).done(function(){
        ths.isSaveProgress(false);
      });
    };
    
    /**
    * Subscribe on changing: check and save when change
    */
    this.procent.subscribe(function(newValue){
      if ($.isNumeric(newValue) === false || +newValue < 0 || +newValue > 100){
        wellItem.removeProcentBorder(ths);
        // Clear the input
        ths.procent(null);
        return;
      }
      else {
        ths.save();
      }
    });
	};

	return exports;
});
