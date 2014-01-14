/** @module */
define(['jquery', 'knockout',
    'services/log-of-well',
    'models/img-figure', 'services/img-figure-of-log-of-well'], function ($, ko, logOfWellService, ImgFigure, imgFigureOfLogOfWellService) {
        'use strict';

        /** Import image figures to the log image */
        function importImgFigures(data) {
            return (data || []).map(function (item) {
                return new ImgFigure(item);
            });
        }

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

                // Create new imgFigure: text
                // Add to the history list: set isNew = true
                // When save - add only where isNew = true (change isNew to false)
                // When click 'return' - remove last element from list where isNew = true (old elements can't be removed)

                require(['helpers/log-helper'], function (logHelper) {
                    logHelper.drawText(posX, posY, drawTextBlock);
                });
            };

            /**
            * Figures in this log image: loaded with log-of-well
            */
            this.imgFigures = ko.observableArray();

            this.imgFigures(importImgFigures(data.ListOfDtoOfImgFigure));

            /**
            * Add new figures and remove deleted figures (saveWellLogSelectedFileImagePart)
            */
            this.saveImgFigures = function () {
                var tmpImgFigures = ko.unwrap(ths.imgFigures);

                // Figures without ids: created figures
                var createdImgFigures = tmpImgFigures.filter(function (elem) {
                    return (!elem.id);
                });

                // Add every element
                // TODO: try to make one request
                createdImgFigures.forEach(function (elem) {
                    imgFigureOfLogOfWellService.post(ths.id, elem.toDto()).done(function (res) {
                        console.log(res);
                    });
                });

                // One request per few figures: it's like a put well log event
                // After adding new figures - set ids

                console.log(createdImgFigures);
                // Send to the server
            };

            // TODO: remove links and method
            /** Save part of image */
            ////this.saveWellLogSelectedFileImagePart = function () {
            ////    // TODO: Post part of image
            ////    alert('Saving feature is under construction');
            ////    //public HttpResponseMessage Post([FromUri] int well_id, [FromUri] string purpose, [FromUri] string status, [FromUri] string file_name, [FromBody] ByteImagePart byteImagePart)

            ////    ////var urlQueryParams = {
            ////    ////    well_id: selectedFile.WellId,
            ////    ////    purpose: selectedFile.Purpose,
            ////    ////    status: selectedFile.Status,
            ////    ////    file_name: selectedFile.Name
            ////    ////};

            ////    ////var cnvs = document.getElementById('log_cnvs');

            ////    ////require(['models/byte-image-part'], function () {
            ////    ////    var createdByteImagePart = datacontext.createByteImagePart({
            ////    ////        Base64String: cnvs.toDataURL('image/png').replace('data:image/png;base64,', ''),
            ////    ////        StartY: Math.abs($('#log_img').position().top)
            ////    ////        ////StartY: $(cnvs).position().top
            ////    ////    });

            ////    ////    datacontext.postWellFile(urlQueryParams, createdByteImagePart).done(function (response, statusText, request) {
            ////    ////        ths.WellLogImageUrl(request.getResponseHeader('Location') + '#' + appMoment().format('mmss'));
            ////    ////    });
            ////    ////});
            ////};

            /** Checbox with tools: by default - hand */
            this.checkedLogTool = ko.observable('tool-hand');
        };

        return exports;
    });