/** @module */
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

        this.removeWidgout = function (widgoutToRemove) {
            if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(widgoutToRemove.name) + '"?')) {
                widgoutService.remove(ths.stageKey, ths.id || ths.Id, widgoutToRemove.id).done(function () {
                    ths.widgouts.remove(widgoutToRemove);
                });
            }
        };

        /**
        * Delete only link to file - without removing physically and from section
        * @param {module/prop-spec} fileSpecProp - Property data
        */
        this.deleteImgFileSpec = function (fileSpecProp) {
            // Clean property of this image and nested property with image link (like FileSpec and idOfFileSpec)
            ths[fileSpecProp.addtData.nestedClientId](null);
            ths[fileSpecProp.clientId](null);

            // Every stage has a save method to save current state of model
            ths.save();

            ////var tmpFileSpecElem = ko.unwrap(ths[fileSpecProp.clientId]);
            ////if (!tmpFileSpecElem) { return; }
            ////// Select file section with logos

            ////var idOfFileSpec = tmpFileSpecElem.id;
            ////console.log(idOfFileSpec);
            ////var needSection = ths.getSectionByPatternId('company-summary');
            ////// Remove from file section + clean FileSpec (delete from logo tables)
            ////needSection.deleteFileSpecById(idOfFileSpec, function () {
            ////ths[fileSpecProp.addtData.nestedClientId](null);
            ////ths[fileSpecProp.clientId](null);
            ////});
        };
    };

    return exports;
});