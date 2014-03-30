/** @module */
define(['knockout', 'models/file-spec'], function (ko, FileSpec) {
    'use strict';

    /**
    * Model: file spec of history of well
    * @constructor
    */
    var exports = function (data) {
        data = data || {};

        this.idOfHistoryOfWell = data.IdOfHistoryOfWell;
        this.idOfFileSpec = data.IdOfFileSpec;
        this.description = ko.observable(data.Description);

        /**
        * File specification
        * @type {module:models/file-spec}
        */
        this.fileSpec = new FileSpec(data.FileSpecDto);
    };

    return exports;
});