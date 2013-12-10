/** @module */
define(['jquery', 'knockout'], function ($, ko) {
    'use strict';

    /**
    * Section of well
    * @param {object} data - section data
    * @param {module:models/well} well - well (parent)
    * @constructor
    */
    var exports = function (data, well) {
        data = data || {};

        /** Get parent (well) */
        this.getWell = function () {
            return well;
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

        /**
        * Section pattern (default name, file formats and other params for section)
        * @type {module:models/section-pattern}
        */
        this.SectionPattern = ko.computed({
            read: function () {
                var tmpListOfSectionPattern = ko.unwrap(this.getWell().getWellGroup().getWellField().getWellRegion().getParentViewModel().ListOfSectionPatternDto);
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
        * Id of well
        * @type {number}
        */
        this.WellId = data.WellId;

        /**
        * Whether section is selected
        * @type {boolean}
        */
        this.isSectionSelected = ko.computed({
            read: function () {
                return (ko.unwrap(this.getWell().selectedSection) === this);
            },
            deferEvaluation: true,
            owner: this
        });
    };

    return exports;
});