﻿/** @module */
define(['knockout',
    'models/file-spec',
    'services/file-spec'], function (ko, FileSpec, fileSpecService) {
        'use strict';

        /**
        * Import file specification to the list
        * @param {object} data - Server data with file specs
        */
        function importFileSpecs(data) {
            return data.map(function (item) { return new FileSpec(item); });
        }

        /**
        * Update section after removing files
        */
        function updateSectionAfterRemovingFiles(idOfSectionPattern) {
            switch (idOfSectionPattern) {
                case 'well-volume':
                    ths.getParent().isLoadedVolumes(false);
                    ths.getParent().loadVolumes();
                    break;
            }
        }

        /**
        * Section base: sharep props for other types of sections - insert using call method
        * @constructor
        * @param {object} data - Section data
        */
        var exports = function (data) {
            /** Alternative */
            var ths = this;

            /**
            * Stage, like 'well', 'wield', 'wroup', 'wegion', 'company'
            * @type {string}
            */
            var stageKey = ths.getParent().stageKey;

            /**
            * Section guid
            * @type {string}
            */
            this.id = data.Id;

            /**
            * Whether the section is visible as a view: can ovveride default checkbox from section pattern (isView)
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
                    var tmpListOfSectionPattern = ko.unwrap(ths.getParent().stagePatterns);
                    var tmpSectionPatternId = ths.sectionPatternId;
                    var byId = tmpListOfSectionPattern.filter(function (arrElem) {
                        return arrElem.id === tmpSectionPatternId;
                    });

                    if (byId.length === 1) {
                        return byId[0];
                    }
                },
                deferEvaluation: true
            });

            /**
            * Whether section is visible as view: calculated using section checkbox and pattern checkbox
            * @type {boolean}
            */
            this.isVisibleAsView = ko.computed({
                read: function () {
                    var tmpSectionPattern = ko.unwrap(ths.sectionPattern);
                    var tmpIsVisible = ko.unwrap(ths.isVisible);
                    if (tmpSectionPattern) {
                        return tmpSectionPattern.isView && tmpIsVisible;
                    }
                    else {
                        return false;
                    }
                },
                deferEvaluation: true
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
            * @type {Array.<module:models/file-spec>}
            */
            this.readyListOfFileSpec = ko.computed({
                read: function () {
                    var tmpList = ko.unwrap(ths.listOfFileSpec);
                    return tmpList.sort(function (a, b) {
                        return b.createdUnixTime - a.createdUnixTime;
                    });
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
                if (ko.unwrap(ths.isLoadedListOfFileSpec)) {
                    // Unselect all files in this section
                    var tmpListOfFileSpec = ko.unwrap(ths.listOfFileSpec);

                    tmpListOfFileSpec.forEach(function (elem) {
                        elem.isSelected(false);
                    });

                    return;
                }

                // Loaded files are unselected by default
                fileSpecService.get(stageKey, this.id).done(function (r) {
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
                        ths.listOfFileSpec.push(new FileSpec(result[0]));
                    },
                    url: fileSpecService.getUrl(stageKey, this.id),
                    fileTypeRegExp: ko.unwrap(ths.sectionPattern).fileTypeRegExp
                };
            };

            /** Delete selected files from this section */
            this.deleteSelectedFileSpecs = function () {
                var tmpList = ko.unwrap(ths.listOfFileSpec);

                // Choose selected files
                var tmpSelectedList = tmpList.filter(function (elem) {
                    return ko.unwrap(elem.isSelected);
                });

                // Need to send to the server (only ids - to define and remove files on the server)
                var tmpIdList = tmpSelectedList.map(function (elem) {
                    return { id: elem.id };
                });

                // Remove from server
                fileSpecService.deleteArray(stageKey, ths.id, tmpIdList).done(function () {
                    // If success
                    // Remove from client file list (all selected files)
                    tmpSelectedList.forEach(function (elem) {
                        ths.listOfFileSpec.remove(elem);

                        updateSectionAfterRemovingFiles(ths.sectionPatternId);
                    });
                });
            };

            /**
            * Delete file spec by id
            * @param {string} idOfFileSpec
            * @param {function} callback
            */
            this.deleteFileSpecById = function (idOfFileSpec, callback) {
                // Remove from server
                fileSpecService.deleteArray(stageKey, ths.id, [{ id: idOfFileSpec }]).done(function () {
                    // If success
                    // Remove from client file list if exists
                    var removedFileSpec = ths.getFileSpecById(idOfFileSpec);
                    if (removedFileSpec) {
                        ths.listOfFileSpec.remove(removedFileSpec);
                    }

                    if (callback) {
                        callback();
                    }
                });
            };

            /**
            * Get file spec by id
            * @param {string} idOfFileSpec
            */
            this.getFileSpecById = function (idOfFileSpec) {
                return ko.unwrap(ths.listOfFileSpec).filter(function (elem) {
                    return elem.id === idOfFileSpec;
                })[0];
            };

            /**
            * Whether any file is selected: to activate delete button or smth else
            * @type {boolean}
            */
            this.isSelectedAnyFile = ko.computed({
                read: function () {
                    var tmpList = ko.unwrap(ths.listOfFileSpec);

                    return tmpList.filter(function (elem) {
                        return ko.unwrap(elem.isSelected);
                    }).length > 0;
                },
                deferEvaluation: true
            });
        };

        return exports;
    });