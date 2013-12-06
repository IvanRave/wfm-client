/** @module */
define(['jquery', 'knockout'], function ($, ko) {
    'use strict';

    /**
    * Section of well field
    * @param {object} data - section data
    * @param {module:models/well-field} wield - well field (parent)
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
        this.Id = data.Id;

        /**
        * Whether the section is visible
        * @type {boolean}
        */
        this.IsVisible = ko.observable(data.IsVisible);

        /**
        * Id of section pattern: contains info like section Name and other
        * @type {string}
        */
        this.SectionPatternId = data.SectionPatternId;


        this.SectionPattern = ko.computed({
            read: function () {
                var tmpListOfSectionPattern = ko.unwrap(this.getWield().getWellRegion().getParentViewModel().ListOfSectionPatternDto);
                var tmpSectionPatternId = this.SectionPatternId;
                var byId = $.grep(tmpListOfSectionPattern, function (arrElem) {
                    return arrElem.Id === tmpSectionPatternId;
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
        this.WieldId = data.WieldId;

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
    };

    return exports;
});