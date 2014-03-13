/** @module */
define(['knockout', 'models/widgock', 'services/widgout'], function (ko, Widgock, widgoutService) {
	'use strict';

	/** Import widget block list to layout */
	function importWidgocks(data, widgoutItem) {
		return (data || []).map(function (item) {
			return new Widgock(item, widgoutItem);
		});
	}

	/**
	 * Widget layout
	 * @constructor
	 */
	var exports = function (data, parent) {
		data = data || {};

    /**
    * Getter for a parent stage (well, group, field... )
    * @returns {module:models/bases/stage-base}
    */
		this.getParent = function () {
			return parent;
		};

		/**
		 * Layout id (guid)
		 * @type {string}
		 */
		this.id = data.Id;

    /**
    * A name of the layout
    * @type {string}
    */
		this.name = ko.observable(data.Name);

    // Save, when a name is changed */
		this.name.subscribe(this.save);

		/** 
    * Well widget block list 
    * @type {Array.<module:models/widgock>}
    */
		this.widgocks = ko.observableArray(importWidgocks(data.WidgockDtoList, this));
	};

	/** Save a layout */
	exports.prototype.save = function () {
		var ths = this;
		// Get well id as parent
		var tmpStageId = ths.getParent().Id || ths.getParent().id;

		widgoutService.put(ths.getParent().stageKey, tmpStageId, ths.id, {
			id : ths.id,
			name : ko.unwrap(ths.name)
		});
	};

	return exports;
});
