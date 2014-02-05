/** @module */
define(['models/file-spec'], function (FileSpec) {
    'use strict';

    /**
    * WFM image: cropped image
    * @constructor
    */
    var exports = function (data) {
        data = data || {};

        ////var ths = this;

        /** Id of image */
        this.id = data.Id;

        this.idOfFileSpec = data.IdOfFileSpec;

        this.fileSpec = new FileSpec(data.FileSpecDto);

        //// Name of image: previous url
        ////this.Name = data.Name;

        this.x1 = data.X1;
        this.y1 = data.Y1;
        this.x2 = data.X2;
        this.y2 = data.Y2;
        this.cropXUnits = data.CropXUnits;
        this.cropYUnits = data.CropYUnits;

        /**
        * Cropped image url: creaded from file url and all coords
        * @type {string}
        */
        this.croppedImageUrl = data.CroppedImageUrl;
    };

    return exports;
});