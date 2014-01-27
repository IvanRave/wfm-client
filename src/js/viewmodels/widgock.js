﻿define(['knockout',
    'viewmodels/widget'],
    function (ko,
        VwmWidget) {
        'use strict';

        /**
        * Viewmodel: widget block
        * @constructor
        */
        var exports = function (mdlWidgock, fmgrLink) {
            var ths = this;

            /**
            * Model: widget block for this view
            * @type {<module:models/widgock>}
            */
            this.mdlWidgock = mdlWidgock;

            this.fmgr = fmgrLink;

            /**
            * List of viewmodels of widgets
            * @type {Array.<module:viewmodels/widget>}
            */
            this.listOfVwmWidget = ko.computed({
                read: function () {
                    return ko.unwrap(mdlWidgock.widgetList).map(function (elem) {
                        return new VwmWidget(elem, ths.fmgr);
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
                    mdlWidgock.addWidget(ko.unwrap(tmpStagePattern.name), tmpStagePattern.id);
                }
            };
        };

        return exports;
    });