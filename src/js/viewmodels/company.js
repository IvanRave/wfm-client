/** @module */
define(['knockout',
    'viewmodels/wegion',
    'base-viewmodels/stage-base',
    'base-viewmodels/stage-child-base'],
    function (ko,
        VwmWegion,
        VwmStageBase,
        VwmStageChildBase) {
        'use strict';

        /**
        * Company view model
        * @constructor
        */
        var exports = function (mdlCompany, koUnqOfSlcVwmStage, defaultSlcData) {

            /** Alternative of this */
            var ths = this;

            /**
            * Company data model
            * @type {module:models/company}
            */
            this.mdlStage = mdlCompany;

            this.unq = mdlCompany.id;

            /** File manager as modal window for this view: created from modalFileMgr */
            this.fmgr = {
                isOpen: ko.observable(false),
                okDescription: ko.observable(''),
                okError: ko.observable(''),
                // Callback for Ok button
                okCallback: ko.observable(),
                // When click from view using data-bind click event, then first argument - it is context
                show: function () {
                    // TODO: add ok callback description: 'choose map file...'
                    ths.fmgr.isOpen(true);
                },
                hide: function () {
                    ths.fmgr.isOpen(false);
                },
                hiddenCallback: function () {
                    ths.fmgr.isOpen(false);
                    ths.fmgr.okDescription('');
                    ths.fmgr.okError('');
                    ths.fmgr.okCallback(null);
                }
            };

            /**
            * List of view of well regions
            * @type {Array.<module:viewmodels/wegion>}
            */
            this.listOfVwmChild = ko.computed({
                read: function () {
                    var tmpListOfMdlWegion = ko.unwrap(ths.mdlStage.wegions);
                    return tmpListOfMdlWegion.map(function (elem) {
                        return new VwmWegion(elem, ths, defaultSlcData);
                    });
                },
                deferEvaluation: true
            });

            /**
            * Base for all stages: with selected view of wegion
            */
            VwmStageBase.call(this, defaultSlcData.companySectionId, koUnqOfSlcVwmStage);

            /** Base for all stages with childs */
            VwmStageChildBase.call(this, defaultSlcData.wegionId);

            // Has no parent with few companies (no VwmParentStageBase)

            this.selectAncestorVwms = function () {
                ////console.log('company select ancestor');
                koUnqOfSlcVwmStage(ths.unq);
            };
        };

        return exports;
    });