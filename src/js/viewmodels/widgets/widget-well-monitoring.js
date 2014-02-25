/** @module */
define(['knockout',
  'viewmodels/monitoring-of-well'], 
  function (ko,
  VwmMonitoringOfWell) {
    'use strict';

    // Subtype from Widget
    var exports = function (opts, mdlWell) {
        var ths = this;
        opts = opts || {};
        
        this.widgetVwmMonitoringOfWell = new VwmMonitoringOfWell(opts, mdlWell);

        /**
        * Convert to JSON string to save options on the server
        */
        this.toStringifyOpts = function () {
            return JSON.stringify({
                'StartUnixTime': ko.unwrap(ths.widgetVwmMonitoringOfWell['startUnixTime']),
                'EndUnixTime': ko.unwrap(ths.widgetVwmMonitoringOfWell['endUnixTime'])
            });
        };
    };

    return exports;
});