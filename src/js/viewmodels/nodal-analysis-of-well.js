/** @module */
define(['knockout'], function (ko) {
	'use strict';

	/**
	 * Viewmodel: nodal analysis
	 * @constructor
	 */
	var exports = function (mdlNodalAnalysis, koVidOfSlcVwmNodalAnalysis) {
        
        var ths = this;
        
		this.mdlNodalAnalysis = mdlNodalAnalysis;
        
        /**
         * Id of viewmodel = id of file spec (unique per well)
         * @type {string}
         */
        this.vid = mdlNodalAnalysis.idOfFileSpec;
        
        /**
         * Whether view model is selected
         * @type {boolean}
         */
        this.isSlc = ko.computed({
            read: function(){
                return ths.vid === ko.unwrap(koVidOfSlcVwmNodalAnalysis);
            },
            deferEvaluation: true
        });
	};

	return exports;
});