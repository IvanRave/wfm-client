define(['knockout',
    'viewmodels/widgets/widget-default-summary',
    ////'models/widgets/widget-well-perfomance',
    'viewmodels/widgets/widget-well-sketch',
    ////'models/widgets/widget-well-history',
    'viewmodels/widgets/widget-wield-map'],
    function (ko,
        VwmWidgetDefaultSummary,
        VwmWidgetWellSketch,
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

            switch (mdlWidget.idOfSectionPattern) {
                case 'well-summary':
                case 'wroup-summary':
                case 'wield-summary':
                case 'wegion-summary':
                case 'company-summary':
                    var tmpPropSpecList = ko.unwrap(ths.mdlWidget.getWidgock().getWidgout().getParent().propSpecList);
                    // No view properties in summary section
                    VwmWidgetDefaultSummary.call(ths, widgetOpts, tmpPropSpecList);
                    break;
                    ////case 'well-perfomance':
                    ////    WidgetWellPerfomance.call(ths, optsObj, ths.getWidgock());
                    ////    break;
                    ////case 'well-sketch':
                    ////    WidgetWellSketch.call(ths, optsObj);
                    ////    break;
                    ////case 'well-history':
                    ////    WidgetWellHistory.call(ths, optsObj, ths.getWidgock().getWidgout().getParent().historyList);
                    ////    break;
                case 'wield-map':
                    ////require(['viewmodels/wield'], function (asdf) {
                    ////    console.log('asdf', asdf);
                    ////});
                    var tmpMdlWield = ths.mdlWidget.getWidgock().getWidgout().getParent();
                    VwmWidgetWieldMap.call(ths, widgetOpts, tmpMdlWield);
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