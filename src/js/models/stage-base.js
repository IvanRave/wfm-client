/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /**
    * Base for all stages: well, group, region etc.
    */
    var exports = function () {
        var ths = this;

        /** List of sections */
        this.listOfSection = ko.observableArray();

        /** Selected section */
        this.selectedSection = ko.observable();

        /** Selected section in file manager */
        this.selectedFileSection = ko.observable();

        /** Select file section (in file manager) */
        this.selectFileSection = function (fileSectionToSelect) {
            // Load files from server (if not loaded)
            // If loaded - clean selected states
            fileSectionToSelect.loadListOfFileSpec();

            // Set as a selected to show files
            ths.selectedFileSection(fileSectionToSelect);
        };

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
    };

    return exports;
});