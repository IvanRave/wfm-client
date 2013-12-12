define(['jquery', 'knockout', 'models/file-spec', 'services/file-spec'], function ($, ko, FileSpec, fileSpecService) {
    'use strict';

    /**
    * Import file specification to the list
    * @param {object} data - Server data with file specs
    */
    function importFileSpecs(data) {
        return $.map(data, function (item) {
            return new FileSpec(item);
        });
    }

    /**
    * Section base: sharep props for other types of sections - insert using call method
    * @constructor
    * @param {object} data - Section data
    * @param {string} typeOfStage - Stage, like 'well', 'wield', 'wroup', 'wegion', 'company'
    */
    var exports = function (data, typeOfStage) {
        /** Alternative */
        var ths = this;

        /**
        * Section guid
        * @type {string}
        */
        this.id = data.Id;

        /**
        * Whether the section is visible
        * @type {boolean}
        */
        this.isVisible = ko.observable(data.IsVisible);

        /**
        * Id of section pattern: contains info like section Name and other
        * @type {string}
        */
        this.sectionPatternId = data.SectionPatternId;

        /**
        * Section pattern (default name, file formats and other params for section)
        * @type {module:models/section-pattern}
        */
        this.sectionPattern = ko.computed({
            read: function () {
                var tmpListOfSectionPattern = this.getListOfSectionPattern();
                var tmpSectionPatternId = this.sectionPatternId;
                var byId = $.grep(tmpListOfSectionPattern, function (arrElem) {
                    return arrElem.id === tmpSectionPatternId;
                });

                if (byId.length === 1) {
                    return byId[0];
                }
            },
            deferEvaluation: true,
            owner: this
        });

        /**
        * Whether section is selected
        * @type {boolean}
        */
        this.isSelectedSection = ko.computed({
            read: function () {
                return (ko.unwrap(this.getParent().selectedSection) === this);
            },
            deferEvaluation: true,
            owner: this
        });

        /**
        * Whether this file section is selected (the same section, only for file manager)
        * @type {boolean}
        */
        this.isSelectedFileSection = ko.computed({
            read: function () {
                return (ko.unwrap(this.getParent().selectedFileSection) === this);
            },
            deferEvaluation: true,
            owner: this
        });

        /**
        * List of file specifications
        * @type {Array.<module:models/file-spec>}
        */
        this.listOfFileSpec = ko.observableArray();

        /**
        * Sorted and filtered list of files: ready to view
        * @type {Array.<module:models/file-spec}
        */
        this.readyListOfFileSpec = ko.computed({
            read: function () {
                var tmpList = ko.unwrap(ths.listOfFileSpec);
                return tmpList;
            },
            deferEvaluation: true
        });

        /**
        * Whether files are loaded
        * @type {boolean}
        */
        this.isLoadedListOfFileSpec = ko.observable(false);

        /** Load list of file spec from the server */
        this.loadListOfFileSpec = function () {
            // Do not load if loaded already
            if (ko.unwrap(ths.isLoadedListOfFileSpec)) { return; }

            fileSpecService[typeOfStage].get(this.id).done(function (r) {
                // Import data to objects
                ths.listOfFileSpec(importFileSpecs(r));
                // Set flag (do not load again)
                ths.isLoadedListOfFileSpec(true);
            });
        };

        /** Get settings for file loader: only after defining of SectionPattern */
        this.getSectionFiloader = function () {
            return {
                callback: function (result) {
                    ths.listOfFileSpec.push(new FileSpec(result));
                },
                url: fileSpecService[typeOfStage].getUrl(this.id),
                fileTypeRegExp: ko.unwrap(ths.sectionPattern).fileTypeRegExp
            };
        };
    };

    return exports;
});