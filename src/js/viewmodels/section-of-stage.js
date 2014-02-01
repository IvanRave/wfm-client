/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /**
    * View model of section of stage (company-sections --- well sections)
    * @constructor
    * @param {module:models/section-of-stage} mdlSection - Section model with data
    * @param {object} vwmStage - Stage view, which may have sections (company ... well)
    */
    var exports = function (mdlSection, vwmStage) {
        /**
        * Section data model
        * @type {module:models/section-of-stage}
        */
        this.mdlSection = mdlSection;

        /** Section identificator: to calculate selected (by default) section */
        this.unz = mdlSection.sectionPatternId;

        /**
        * Whether section is selected
        * @type {boolean}
        */
        this.isSlcVwmSectionWrk = ko.computed({
            read: function () {
                return (ko.unwrap(vwmStage.slcVwmSectionWrk) === this);
            },
            deferEvaluation: true,
            owner: this
        });

        /**
        * Whether this file section is selected (the same section, only for file manager)
        * @type {boolean}
        */
        this.isSlcVwmSectionFmg = ko.computed({
            read: function () {
                return (ko.unwrap(vwmStage.slcVwmSectionFmg) === this);
            },
            deferEvaluation: true,
            owner: this
        });
    };

    return exports;
});