/** @module */
define(['knockout',
    'services/datacontext',
    'helpers/app-helper',
    'models/file-spec'], function (ko, datacontext, appHelper, FileSpec) {
        'use strict';

        /**
        * Model: file spec of history of well
        * @constructor
        */
        var exports = function (data) {
            data = data || {};

            ////var ths = this;

            this.idOfHistoryOfWell = data.IdOfHistoryOfWell;
            this.idOfFileSpec = data.IdOfFileSpec;
            this.description = ko.observable(data.Description);

            /**
            * File specification
            * @type {module:models/file-spec}
            */
            this.fileSpec = new FileSpec(data.FileSpecDto);

            ////this.downloadWellHistoryFile = function () {
            ////    var urlPartArray = ths.CloudFileUrl.split('/');

            ////    appHelper.downloadURL(datacontext.getWellFileUrl({
            ////        well_id: urlPartArray[0],
            ////        purpose: urlPartArray[1],
            ////        status: urlPartArray[2],
            ////        file_name: urlPartArray[3]
            ////    }));
            ////};

            ////this.toPlainJson = function () { return ko.toJS(ths); };
        };

        return exports;
    });