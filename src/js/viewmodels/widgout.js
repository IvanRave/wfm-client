/** @module */
define(['knockout',
    'viewmodels/widgock'],
    function (ko,
        VwmWidgock) {

        'use strict';

        /**
        * Viewmodel: widget layout (show widget layout model)
        * @constructor
        */
        var exports = function (mdlWidgout, fmgrLink) {
            
            var ths = this;

            /**
            * Model widget layout
            * @type {<module:models/widgout>}
            */
            this.mdlWidgout = mdlWidgout;

            this.fmgr = fmgrLink;

            /**
            * Widget layout name for view
            * @type {string}
            */
            this.name = mdlWidgout.name;

            /**
            * List of views of widget blocks
            * @type {Array.<module:viewmodels/widgock>}
            */
            this.listOfVwmWidgock = ko.computed({
                read: function () {
                    return ko.unwrap(mdlWidgout.widgocks).map(function (elem) {
                        return new VwmWidgock(elem, ths.fmgr);
                    });
                },
                deferEvaluation: true
            });
        };

        return exports;
    });