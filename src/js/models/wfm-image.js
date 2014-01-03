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

        ////this.ImgUrl = ko.computed(function () {
        ////    // GetCropImage(int well_id, string purpose, string status, string file_name, string crop)
        ////    var nameArray = ths.Name.split('/');
        ////    var urlQueryParams = {
        ////        well_id: nameArray[0],
        ////        purpose: nameArray[1],
        ////        status: nameArray[2],
        ////        file_name: nameArray[3],
        ////        crop: '(' + [ths.X1, ths.Y1, ths.X2, ths.Y2].join(',') + ')'
        ////    };

        ////    return datacontext.getWellFileUrl(urlQueryParams);
        ////    // divide name by slash
        ////    // add coords
        ////    // take wellfileurl with urlqueryparams
        ////});
    };

    return exports;
});