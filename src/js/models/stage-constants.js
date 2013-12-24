/** @module */
define([], function () {
    'use strict';

    /**
    * Stage constants: id == key (to use without strings, only by keys, like: stageConstants[stageKey])
    * @constructor
    */
    var exports = {
        company: { id: 'company', single: 'company', plural: 'companies' },
        wegion: { id: 'wegion', single: 'well-region', plural: 'well-regions' },
        wield: { id: 'wield', single: 'well-field', plural: 'well-fields' },
        wroup: { id: 'wroup', single: 'well-group', plural: 'well-groups' },
        well: { id: 'well', single: 'well', plural: 'wells' }
    };

    return exports;
});