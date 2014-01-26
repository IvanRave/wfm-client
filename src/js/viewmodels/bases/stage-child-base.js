/** @module */
define(['knockout',
    'helpers/history-helper'],
    function (ko,
        historyHelper) {
        'use strict';

        /**
        * Base view for manage childs of main stages: userProfile, company, wegion, wield, wroup (well has no childrens)
        * @constructor
        */
        var exports = function (defaultUnqOfSlcVwmChild) {
            // First need to point: listOfVwmChild (children's viewmodels)
            var ths = this;

            /** Unique key of viewmodel of selected child */
            this.unqOfSlcVwmChild = ko.observable(defaultUnqOfSlcVwmChild);

            // Remove default value to not reuse again
            defaultUnqOfSlcVwmChild = null;

            /** Child viewmodel - current selected employee */
            this.slcVwmChild = ko.computed({
                read: function () {
                    var tmpUnq = ko.unwrap(ths.unqOfSlcVwmChild);
                    if (tmpUnq) {
                        return ko.unwrap(ths.listOfVwmChild).filter(function (elem) {
                            return elem.unq === tmpUnq;
                        })[0];
                    }
                },
                deferEvaluation: true
            });

            /** Select view of child */
            this.selectVwmChild = function (vwmChildToSelect) {
                console.log('vwmChildToSelect', vwmChildToSelect);
                // Unselect all childs for child (to show content only for this stage);
                vwmChildToSelect.unqOfSlcVwmChild(null);

                ths.unqOfSlcVwmChild(vwmChildToSelect.unq);

                // if no section is defined, then set to null (show dashboard)
                vwmChildToSelect.unselectVwmSectionWrk();

                var navigationArr = historyHelper.getNavigationArr(vwmChildToSelect.mdlStage);
                
                historyHelper.pushState('/' + navigationArr.join('/'));
            };

            /** Unselect: show content of parent node, like WFM logo click: unselect choosed company and show company list */
            this.unselectVwmChild = function () {
                ths.unqOfSlcVwmChild(null);

                var navigationArr = historyHelper.getNavigationArr(ths.mdlStage);

                historyHelper.pushState('/' + navigationArr.join('/'));
            };

            /////**
            ////    * Select child stage: initial function for all 'select child' on every stage (well has no child stage)
            ////    * @param {object} childStage - Child stage: like well, wroup, wield, wegion, company
            ////    */
            ////this.selectChildStage = function (childStage) {
            ////    childStage.isOpenItem(true);

            ////    // Push to the navigation url: no need 
            ////    // When you select stage, then selected any of the sections (or unselect section)
            ////    // On this moment url will be changed
            ////    // By default: 
            ////    // 1. Load section from url
            ////    // 2. Load section from previous selected stage from the same level
            ////    // If not: unselect sections (show dashboard) //childStage.unselectSection();

            ////    ////var tmpInitialUrlData = ko.unwrap(ths.getRootMdl().initialUrlData);
            ////    ////console.log('initialUrlData', tmpInitialUrlData);
            ////    ////var navigationArr = getNavigationArr(childStage);

            ////    ////if (navigationArr) {
            ////    ////    historyHelper.pushState('/' + navigationArr.join('/'));
            ////    ////}
            ////    ////else {
            ////    ////    throw new Error('SelectChildStage: no stage for navigation url in stage-base');
            ////    ////}

            ////};
        };

        return exports;
    });