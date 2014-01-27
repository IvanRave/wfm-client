/** @module */
define(['knockout'], function (ko) {
    'use strict';

    /**
    * Base: for every stage, that have parent with few children
    */
    var exports = function (koSlcVwmStage) {

        var ths = this;

        /** 
        * Whether region is selected
        *    Company has wegions. This wegion is selected. Always true
        * @type {boolean}
        */
        this.isSlcVwmStage = ko.computed({
            read: function () {
                // TODO: Check
                // Selected child of this stage (stage with lewer level)
                var tmpSlcVwmStage = ko.unwrap(koSlcVwmStage);
                if (tmpSlcVwmStage) {
                    return (ths.unq === tmpSlcVwmStage.unq);
                }
                return false;
            },
            deferEvaluation: true
        });

        /**
        * Whether menu item is opened: showed inner object in menu without main content
        * @type {boolean}
        */
        this.isOpenedItem = ko.observable(false);

        /** Toggle isOpen state */
        this.toggleItem = function () {
            ths.isOpenedItem(!ko.unwrap(ths.isOpenedItem));
        };

        /** Css class for opened item (open or showed) */
        this.menuItemCss = ko.computed({
            read: function () {
                // { 'glyphicon-circle-arrow-down' : isOpenedItem, 'glyphicon-circle-arrow-right' : !isOpenedItem() }
                return ko.unwrap(ths.isOpenedItem) ? 'glyphicon-circle-arrow-down' : 'glyphicon-circle-arrow-right';
            },
            deferEvaluation: true
        });

        /** Selected stages are opened by default */
        this.isSlcVwmStage.subscribe(function (tmpIsSlcVwmStage) {
            // Where stage is selected - open it in menu
            ths.isOpenedItem(tmpIsSlcVwmStage);
        });
    };

    return exports;
});