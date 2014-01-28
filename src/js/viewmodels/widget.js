define(['knockout',
    'viewmodels/widgets/widget-default-summary',
    ////'models/widgets/widget-well-perfomance',
    'viewmodels/widgets/widget-well-sketch',
    'viewmodels/widgets/widget-well-history',
    'viewmodels/widgets/widget-wield-map'],
    function (ko,
        VwmWidgetDefaultSummary,
        VwmWidgetWellSketch,
        VwmWidgetWellHistory,
        VwmWidgetWieldMap) {
        'use strict';

        /**
        * Viewmodel: widget
        * @constructor
        */
        var exports = function (mdlWidget, fmgrLink) {

            var ths = this;

            /**
            * Model: widget
            * @type {<module:models/widget>}
            */
            this.mdlWidget = mdlWidget;

            this.fmgr = fmgrLink;

            this.isVisSettingPanel = ko.observable(false);

            this.showVisSettingPanel = function () {
                ths.isVisSettingPanel(true);
            };

            var widgetOpts = mdlWidget.widgetOpts;

            var tmpWidgetMdlStage = ths.mdlWidget.getWidgock().getWidgout().getParent();

            switch (mdlWidget.idOfSectionPattern) {
                case 'well-summary':
                case 'wroup-summary':
                case 'wield-summary':
                case 'wegion-summary':
                case 'company-summary':
                    var tmpPropSpecList = ko.unwrap(tmpWidgetMdlStage.propSpecList);
                    // No view properties in summary section
                    VwmWidgetDefaultSummary.call(ths, widgetOpts, tmpPropSpecList);
                    break;
                    ////case 'well-perfomance':
                    ////    WidgetWellPerfomance.call(ths, optsObj, ths.getWidgock());
                    ////    break;
                case 'well-history':
                    var koJobTypeList = tmpWidgetMdlStage.getWellGroup().getWellField().getWellRegion().getCompany().jobTypeList;
                    VwmWidgetWellHistory.call(ths, widgetOpts, tmpWidgetMdlStage.historyList, koJobTypeList);
                    break;
                case 'wield-map':
                    ////require(['viewmodels/wield'], function (asdf) {
                    ////    console.log('asdf', asdf);
                    ////});
                    VwmWidgetWieldMap.call(ths, widgetOpts, tmpWidgetMdlStage);
                    break;
                case 'well-sketch':
                    VwmWidgetWellSketch.call(ths, widgetOpts);
                    break;
            }

            /** Save model through viewmodel */
            this.saveVwmWidget = function () {
                mdlWidget.putWidget(ths.toStringifyOpts(), function () {
                    // Close settings after saving
                    ths.isVisSettingPanel(false);
                });
            };
        };

        return exports;
    });