/** @module */
define(['knockout'], function(ko){
  'use strict';
  
  /**
  * A shared monitoring viewmodel for widgets and sections
  * @constructor
  */
  var exports = function(opts, mdlWell){
    /** Alternative */
    var ths = this;
    
    /**
		 * A date border to filter monitoring data
		 * @type {object}
		 */
		this.mntrUnixTimeBorder = {
      // By default: loaded from server options for a widget
      // no default for main section views
			start : ko.observable(opts['StartUnixTime']),
			end : ko.observable(opts['EndUnixTime'])
		};
    
    /**
    * Load the list, using filtered dates (if both exists)
    */
    this.loadFilteredListOfMonitoringRecord = function(){
      var startUnixTime = ko.unwrap(ths.mntrUnixTimeBorder.start);
      if (startUnixTime){
        var endUnixTime = ko.unwrap(ths.mntrUnixTimeBorder.end);
        if (endUnixTime){
          mdlWell.loadListOfMonitoringRecord(startUnixTime, endUnixTime);
        }
      }
    };
    
    // When a user changes filtered dates - reload monitoring records
    this.mntrUnixTimeBorder.start.subscribe(ths.loadFilteredListOfMonitoringRecord);
    this.mntrUnixTimeBorder.end.subscribe(ths.loadFilteredListOfMonitoringRecord);
  };
  
  return exports;
});