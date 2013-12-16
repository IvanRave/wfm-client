/** @module */
define(['knockout', 'models/file-spec'], function (ko, FileSpec) {
    'use strict';

    /**
    * Sketch of well
    * @constructor
    * @param {object} data - Sketch data
    */
    var exports = function (data) {
        data = data || {};

        /**
        * Id of well
        * @type {number}
        */
        this.idOfWell = data.IdOfWell;

        /**
        * Id of file (guid): can not be changed: when select new file - recreate WellSketch model
        * @type {string}
        */
        this.idOfFileSpec = data.IdOfFileSpec;

        /**
        * File spec
        * @type {module:models/file-spec}
        */
        this.fileSpec = new FileSpec(data.FileSpecDto);

        /**
        * Name of sketch
        * @type {string}
        */
        this.name = ko.observable(data.Name);

        /**
        * Description of sketch (html code)
        * @type {string}
        */
        this.description = ko.observable(data.Description);
    };

    return exports;
});