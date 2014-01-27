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

                vwmChildToSelect.isOpenedItem(true);

                var navigationArr = historyHelper.getNavigationArr(vwmChildToSelect.mdlStage);
                
                historyHelper.pushState('/' + navigationArr.join('/'));
            };

            /** Unselect: show content of parent node, like WFM logo click: unselect choosed company and show company list */
            this.unselectVwmChild = function () {
                ths.unqOfSlcVwmChild(null);

                var navigationArr = historyHelper.getNavigationArr(ths.mdlStage);

                historyHelper.pushState('/' + navigationArr.join('/'));
            };
        };

        return exports;
    });