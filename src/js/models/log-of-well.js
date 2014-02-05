/** @module */
define(['jquery', 'knockout',
    'services/log-of-well',
    'models/svg-elem', 'services/svg-elem-of-log-of-well'], function ($, ko, logOfWellService, ImgFigure, svgElemOfLogOfWellService) {
        'use strict';

        /**
        * Import image figures to the log image
        */
        function importImgFigures(data) {
            return (data || []).map(function (item) {
                return new ImgFigure(item);
            });
        }

        /**
        * Log of well model
        * @constructor
        */
        var exports = function (data) {
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
            * Url of log image, generated from log file
            * @type {string}
            */
            this.representationUrl = logOfWellService.getUrl(ths.idOfWell, ths.id);

            /**
            * Figures in this log image: loaded with log-of-well
            */
            this.imgFigures = ko.observableArray(importImgFigures(data.ListOfSvgElemDto));

            /**
            * Whether saving is enabled 
            * @type {boolean}
            */
            this.isEnabledSavingSvgElems = ko.observable(true);

            /**
            * Add new figures and remove deleted figures
            */
            this.saveSvgElems = function () {
                var tmpImgFigures = ko.unwrap(ths.imgFigures);

                // Figures without ids: created figures
                var createdImgFigures = tmpImgFigures.filter(function (elem) {
                    return (!elem.id);
                });

                // Nothing to save
                if (createdImgFigures.length === 0) { return; }

                ths.isEnabledSavingSvgElems(false);

                // Add every element
                // TODO: try to make one request: one request per few figures: it's like a put well log event
                createdImgFigures.forEach(function (elem, elemIndex) {
                    svgElemOfLogOfWellService.post(ths.id, elem.toDto()).done(function (res) {
                        // After adding new figures - set ids
                        elem.id = res.Id;

                        // Allow retry saving
                        if (elemIndex === createdImgFigures.length - 1) {
                            ths.isEnabledSavingSvgElems(true);
                        }
                    });
                });
            };

            /** Checbox with tools: by default - hand */
            this.checkedLogTool = ko.observable('tool-hand');
        };

        return exports;
    });