﻿/** @module */
define(['knockout',
    'models/file-spec',
    'models/widgout',
    'services/widgout'],
    function (ko,
        FileSpec,
        Widgout,
        widgoutService) {
    'use strict';

    /** Import widget layouts to the stage */
    function importWidgouts(data, parentItem) {
        return (data || []).map(function (item) { return new Widgout(item, parentItem); });
    }

    /**
    * Base for all stages: well, group, region etc.
    */
    var exports = function (data) {
        var ths = this;

        /** Props values: all observables */
        this.propSpecList.forEach(function (prop) {
            if (prop.tpe === 'FileLine') {
                // Create new observable file specification
                ths[prop.clientId] = ko.observable();
                // If file exists - create object
                if (data[prop.serverId]) {
                    ths[prop.clientId](new FileSpec(data[prop.serverId]));
                }
            }
            else {
                ths[prop.clientId] = ko.observable(data[prop.serverId]);
            }
        });

        /** Get need property from array */
        this.getPropSpecByClientId = function (clientId) {
            var filteredProps = ths.propSpecList.filter(function (elem) {
                return elem.clientId === clientId;
            });

            return filteredProps[0];
        };

        /** List of sections */
        this.listOfSection = ko.observableArray();

        /**
        * Get section by section pattern id: wrap for selectFileSection function
        * @param {string} idOfPattern - Id of section pattern, like 'wield-map', 'wield-summary'
        */
        this.getSectionByPatternId = function (idOfPattern) {
            var tmpList = ko.unwrap(ths.listOfSection);

            return tmpList.filter(function (elem) {
                return elem.sectionPatternId === idOfPattern;
            })[0];
        };

        /**
        * List of section patterns for current stage (names, ids, etc.)
        *    Section patterns where idOfStage === stageKey
        * @type {Array.<module:models/section-pattern>}
        */
        this.stagePatterns = ko.computed({
            read: function () {
                // List of all section patterns
                var tmpAllPatterns = ko.unwrap(ths.getRootMdl().ListOfSectionPatternDto);
                return tmpAllPatterns.filter(function (elem) {
                    return elem.idOfStage === ths.stageKey;
                });
            },
            deferEvaluation: true
        });

        /**
        * List of patterns for widgets
        * @type {Array.<module:models/section-pattern>}
        */
        this.stagePatternsForWidget = ko.computed({
            read: function () {
                var tmpStagePatterns = ko.unwrap(ths.stagePatterns);
                return tmpStagePatterns.filter(function (elem) {
                    return elem.isWidget;
                });
            },
            deferEvaluation: true
        });

        /** Widget layouts of this stage */
        this.widgouts = ko.observableArray();

        /**
        * Is loaded widget layouts
        * @type {boolean}
        */
        this.isLoadedWidgouts = ko.observable(false);

        /** Load widget layouts for stage */
        this.loadWidgouts = function () {
            if (ko.unwrap(ths.isLoadedWidgouts)) { return; }

            widgoutService.get(ths.stageKey, ths.id || ths.Id).done(function (res) {
                ths.widgouts(importWidgouts(res, ths));
                ths.isLoadedWidgouts(true);
            });
        };

        /** Selected widget layouts: may be defined by default from client storage (cookies..) */
        this.slcWidgout = ko.observable();

        /** Possible widget layout list to insert */
        this.widgoutTemplates = widgoutService.getWidgoutTemplates();

        /** Selected possible widget layout for adding to widget layout list */
        this.slcWidgoutTemplate = ko.observable();

        /** Create widgout */
        this.postWidgout = function () {
            var tmpWidgoutTemlate = ko.unwrap(ths.slcWidgoutTemplate);
            if (tmpWidgoutTemlate) {
                widgoutService.post(ths.stageKey, ths.id || ths.Id, tmpWidgoutTemlate).done(function (createdWellWidgoutData) {
                    var widgoutNew = new Widgout(createdWellWidgoutData, ths);
                    ths.widgouts.push(widgoutNew);
                    ths.slcWidgoutTemplate(null);
                });
            }
        };

        /** Remove widget layout from this stage */
        this.removeWidgout = function () {
            var widgoutToDelete = ko.unwrap(ths.slcWidgout);
            if (widgoutToDelete) {
                if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(widgoutToDelete.name) + '"?')) {
                    widgoutService.remove(ths.stageKey, ths.id || ths.Id, widgoutToDelete.id).done(function () {
                        ths.widgouts.remove(widgoutToDelete);
                    });
                }
            }
        };
    };

    return exports;
});