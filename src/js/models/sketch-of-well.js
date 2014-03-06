/**
* @module
*/
define(['knockout', 'models/file-spec', 'services/sketch-of-well'], function (ko, FileSpec, sketchOfWellService) {
    'use strict';

    /**
    * Sketch of well
    * @constructor
    */
    var exports = function (well) {
        /** Alternative */
        var ths = this;

        /** Get well (parent) */
        this.getWell = function () {
            return well;
        };

        /**
        * Id of well
        * @type {number}
        */
        this.idOfWell = ths.getWell().Id;

        /**
        * Id of file (guid): can not be changed: when select new file - recreate WellSketch model
        * @type {string}
        */
        this.idOfFileSpec = ko.observable();

        /**
        * File spec
        * @type {module:models/file-spec}
        */
        this.fileSpec = ko.observable();

        /**
        * Name of sketch
        * @type {string}
        */
        this.name = ko.observable();

        /**
        * Description of sketch (html code)
        * @type {string}
        */
        this.description = ko.observable();

        this.isLoaded = ko.observable(false);

        /** Load well sketches: get only first elem of array: one sketch per well */
        this.load = function () {
            // Load only if not loaded already
            if (ko.unwrap(ths.isLoaded)) { return; }

            // return array of sketch: get only first
            sketchOfWellService.get(ths.idOfWell).done(function (r) {
                if (r.length > 0) {
                    var resSketch = r[0];

                    ths.name(resSketch.Name);
                    ths.description(resSketch.Description);
                    ths.idOfFileSpec(resSketch.IdOfFileSpec);
                    ths.fileSpec(new FileSpec(resSketch.FileSpecDto));
                }
                else {
                    ths.name(null);
                    ths.description(null);
                    ths.idOfFileSpec(null);
                    ths.fileSpec(null);
                }

                ths.isLoaded(true);
            });

        };

        this.save = function () {
            sketchOfWellService.put(ths.idOfWell, {
                idOfWell: ths.idOfWell,
                idOfFileSpec: ko.unwrap(ths.idOfFileSpec),
                name: ko.unwrap(ths.name),
                description: ko.unwrap(ths.description)
            }).done(function (resSketch) {
                ths.name(resSketch.Name);
                ths.description(resSketch.Description);
                ths.idOfFileSpec(resSketch.IdOfFileSpec);
                ths.fileSpec(new FileSpec(resSketch.FileSpecDto));
            });
        };

        this.clearSketchOfWell = function () {
            if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(ths.name) + '"?')) {
                sketchOfWellService.remove(ths.idOfWell).done(function () {
                    // Remove from well on the client
                    ths.name(null);
                    ths.description(null);
                    ths.idOfFileSpec(null);
                    ths.fileSpec(null);
                });
            }
        };

        this.putSketchOfWell = function (tmpIdOfFileSpec, tmpName, scsCallback) {
            // Change sketch (create if not exists)
            sketchOfWellService.put(ths.idOfWell, {
                idOfWell: ths.idOfWell,
                idOfFileSpec: tmpIdOfFileSpec,
                name: tmpName || '',
                description: ko.unwrap(ths.description) || ''
            }).done(function (resSketch) {
                ths.name(resSketch.Name);
                ths.description(resSketch.Description);
                ths.idOfFileSpec(resSketch.IdOfFileSpec);
                ths.fileSpec(new FileSpec(resSketch.FileSpecDto));
                scsCallback();
            });
        };
    };

    return exports;
});