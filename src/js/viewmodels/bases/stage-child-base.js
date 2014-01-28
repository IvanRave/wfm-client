/** @module */
define(['knockout',
    'helpers/history-helper'],
    function (ko,
        historyHelper) {
        'use strict';

        /**
        * Base view for manage childs of main stages: userProfile, company, wegion, wield, wroup (well has no childrens)
        *    If stage has children
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

            /**
            * Select view of child
            *    For userProfile - employee (
            */
            this.selectVwmChild = function (vwmChildToSelect) {
                console.log('selected', vwmChildToSelect);
                ////// Unselect previous child
                ths.unqOfSlcVwmChild(null);

                var navigationArr = [];
                if (vwmChildToSelect.unqOfSlcVwmChild) {
                    vwmChildToSelect.unqOfSlcVwmChild(null);
                    navigationArr = historyHelper.getNavigationArr(vwmChildToSelect.mdlStage);

                    // if no section is defined, then set to null (show dashboard)
                    vwmChildToSelect.unselectVwmSectionWrk();
                }
                else if (vwmChildToSelect.vwmCompany) {
                    vwmChildToSelect.vwmCompany.unqOfSlcVwmChild(null);
                    navigationArr = historyHelper.getNavigationArr(vwmChildToSelect.vwmCompany.mdlStage);
                    vwmChildToSelect.vwmCompany.unselectVwmSectionWrk();
                }
                else {
                    // For wells without childs
                    navigationArr = historyHelper.getNavigationArr(vwmChildToSelect.mdlStage);

                    // if no section is defined, then set to null (show dashboard)
                    vwmChildToSelect.unselectVwmSectionWrk();
                }

                historyHelper.pushState('/' + navigationArr.join('/'));

                // Select current child
                ths.unqOfSlcVwmChild(vwmChildToSelect.unq);
            };

            ////this.showVwmChildContent = function (vwmChildToShow) {

            ////    // Select this child stage (if not selected)
            ////    // Hide child stages of this child stage
            ////};

            /** Unselect: show content of parent node, like WFM logo click: unselect choosed company and show company list */
            this.unselectVwmChild = function () {
                ths.unqOfSlcVwmChild(null);

                var navigationArr = historyHelper.getNavigationArr(ths.mdlStage);

                historyHelper.pushState('/' + navigationArr.join('/'));
            };
        };

        return exports;
    });