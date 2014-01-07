/** @module */
define(['jquery','knockout', 'services/log-of-well'], function ($, ko, logOfWellService) {
    'use strict';

    /**
    * Log of well model
    * @constructor
    */
    var exports = function (data, slcLogOfWell) {
        data = data || {};

        /** Alterntative */
        var ths = this;

        /**
        * Id of log (guid)
        * @type {string}
        */
        this.id = data.Id;

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

        /** Log name */
        this.name = ko.observable(data.Name);

        /** Log description */
        this.description = ko.observable(data.Description);

        /**
        * Whether current log is selected
        * @type {boolean}
        */
        this.isSelected = ko.computed({
            read: function () {
                return ths === ko.unwrap(slcLogOfWell);
            },
            deferEvaluation: true
        });

        /**
        * Url of log image, generated from log file
        * @type {string}
        */
        this.representationUrl = logOfWellService.getUrl(ths.idOfWell, ths.id);

        /**
        * Draw log text
        */
        this.drawLogText = function (currentWellItem, event) {
            var drawTextBlock = event.currentTarget;
            ////drawTextBlock.style.filter = 'alpha(opacity=50)';
            // coord accordingly drawTextBlock
            var posX = parseFloat(event.pageX - $(drawTextBlock).offset().left);
            var posY = parseFloat(event.pageY - $(drawTextBlock).offset().top);
            require(['helpers/log-helper'], function (logHelper) {
                logHelper.drawText(posX, posY, drawTextBlock);
            });
        };

        /** Save part of image */
        this.saveWellLogSelectedFileImagePart = function () {
            // TODO: Post part of image
            alert('Saving feature is under construction');
            //public HttpResponseMessage Post([FromUri] int well_id, [FromUri] string purpose, [FromUri] string status, [FromUri] string file_name, [FromBody] ByteImagePart byteImagePart)

            ////var urlQueryParams = {
            ////    well_id: selectedFile.WellId,
            ////    purpose: selectedFile.Purpose,
            ////    status: selectedFile.Status,
            ////    file_name: selectedFile.Name
            ////};

            ////var cnvs = document.getElementById('log_cnvs');

            ////require(['models/byte-image-part'], function () {
            ////    var createdByteImagePart = datacontext.createByteImagePart({
            ////        Base64String: cnvs.toDataURL('image/png').replace('data:image/png;base64,', ''),
            ////        StartY: Math.abs($('#log_img').position().top)
            ////        ////StartY: $(cnvs).position().top
            ////    });

            ////    datacontext.postWellFile(urlQueryParams, createdByteImagePart).done(function (response, statusText, request) {
            ////        ths.WellLogImageUrl(request.getResponseHeader('Location') + '#' + appMoment().format('mmss'));
            ////    });
            ////});
        };

        /** Checbox with tools: by default - hand */
        this.checkedLogTool = ko.observable('tool-hand');
    };

    return exports;
});