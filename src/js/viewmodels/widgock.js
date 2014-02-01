/** @module */
define(['knockout',
    'viewmodels/widget'],
    function (ko,
        VwmWidget) {
        'use strict';

        /**
        * Viewmodel: widget block
        * @constructor
        */
        var exports = function (mdlWidgock, vwmWidgout) {
            var ths = this;

            /**
            * Model: widget block for this view
            * @type {module:models/widgock}
            */
            this.mdlWidgock = mdlWidgock;

            this.getVwmWidgout = function () {
                return vwmWidgout;
            };

            /**
            * List of viewmodels of widgets
            * @type {Array.<module:viewmodels/widget>}
            */
            this.listOfVwmWidget = ko.computed({
                read: function () {
                    return ko.unwrap(mdlWidgock.widgetList).map(function (elem) {
                        return new VwmWidget(elem, ths);
                    });
                },
                deferEvaluation: true
            });

            /**
            * Selected section pattern for widget (of this stage)
            * @type {module:models/section-pattern}
            */
            this.slcStagePatternForWidget = ko.observable();

            // Copy to widget
            this.addVwmWidget = function () {
                var tmpStagePattern = ko.unwrap(ths.slcStagePatternForWidget);
                if (tmpStagePattern) {
                    mdlWidgock.addWidget(ko.unwrap(tmpStagePattern.name), tmpStagePattern.id, function (idOfCreatedWidget) {
                        // Find created widget
                        var createdVwmWidget = ko.unwrap(ths.listOfVwmWidget).filter(function (elem) {
                            return elem.mdlWidget.id === idOfCreatedWidget;
                        })[0];

                        // Open settings
                        if (createdVwmWidget) {
                            createdVwmWidget.showVisSettingPanel();
                        }
                    });
                }
            };

            /**
            * Remove widget model and viewmodel
            */
            this.removeVwmWidget = function (vwmWidgetToRemove) {
                var tmpMdl = vwmWidgetToRemove.mdlWidget;
                if (confirm('{{capitalizeFirst lang.confirmToDelete}} "' + ko.unwrap(tmpMdl.name) + '"?')) {
                    ths.mdlWidgock.removeWidget(tmpMdl);
                }
            };
        };

        return exports;
    });