/** @module */
define(['knockout', 'models/file-spec'], function (ko, FileSpec) {
    'use strict';

    /**
    * Volume of well model
    * @constructor
    */
    var exports = function (data, slcVolume) {
        data = data || {};
        
        var ths = this;

        /**
        * Id of parent
        * @type {number}
        */
        this.idOfWell = data.IdOfWell;

        /**
        * Guid of file specification: can not be changed - only re-creation whole object
        * @type {string}
        */
        this.idOfFileSpec = data.IdOfFileSpec;

        /** Volume name */
        this.name = ko.observable(data.Name);

        /** Volume description */
        this.description = ko.observable(data.Description);

        /**
        * File specification 
        * @type {module:models/file-spec}
        */
        this.fileSpec = new FileSpec(data.FileSpecDto);

        /**
        * Whether current volume is selected
        * @type {boolean}
        */
        this.isSlcVolume = ko.computed({
            read: function () {
                return ths === ko.unwrap(slcVolume);
            },
            deferEvaluation: true
        });
    };

    return exports;
});