/** @module */
define(['jquery', 'knockout', 'services/file-spec'], function ($, ko, fileSpecService) {
    'use strict';

    /**
    * Section of well field
    * @param {object} data - section data
    * @param {module:models/wield} wield - well field (parent)
    * @constructor
    */
    var exports = function (data, wield) {
        data = data || {};

        /** Get parent (well field) */
        this.getWield = function () {
            return wield;
        };

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


        this.sectionPattern = ko.computed({
            read: function () {
                var tmpListOfSectionPattern = ko.unwrap(this.getWield().getWellRegion().getParentViewModel().ListOfSectionPatternDto);
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
        * Id of well field
        * @type {number}
        */
        this.wieldId = data.WieldId;

        /**
        * Whether section is selected
        * @type {boolean}
        */
        this.isSectionSelected = ko.computed({
            read: function () {
                return (ko.unwrap(this.getWield().selectedSection) === this);
            },
            deferEvaluation: true,
            owner: this
        });

        this.listOfFileSpec = ko.observableArray();

        this.loadListOfFileSpec = function () {
            fileSpecService.wield.get(this.id).done(function (r) {
                console.log(r);
            });
        };

        this.sectionFiloader = {
            callback: function (result) {
                console.log('add to the section file list', result);
            },
            url: fileSpecService.wield.getUrl(this.id),
            fileFormats: ['image/jpeg', 'image/png'] // get from sectionPattern
        };
    };

    return exports;
});