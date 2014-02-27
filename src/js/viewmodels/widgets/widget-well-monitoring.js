/** @module */
define(['knockout',
  'viewmodels/monitoring-of-well'], 
  function (ko,
  VwmMonitoringOfWell) {
    'use strict';

    // Subtype from Widget
    var exports = function (opts, mdlWell, koListOfMonitoredParams) {
        var ths = this;
        opts = opts || {};
        
        this.widgetVwmMonitoringOfWell = new VwmMonitoringOfWell(opts, mdlWell, koListOfMonitoredParams);

        /**
        * Convert to JSON string to save options on the server
        */
        this.toStringifyOpts = function () {
            return JSON.stringify({
                'StartUnixTime': ko.unwrap(ths.widgetVwmMonitoringOfWell.mntrUnixTimeBorder.start),
                'EndUnixTime': ko.unwrap(ths.widgetVwmMonitoringOfWell.mntrUnixTimeBorder.end)
            });
        };
    };

    return exports;
});