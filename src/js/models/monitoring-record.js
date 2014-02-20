/** @module */
define(['knockout'], function (ko) {
	'use strict';

	/**
	 * Model: a monitoring record (for a well and well field monitoring section)
	 * @constructor
	 */
	var exports = function (data) {
		data = data || {};

		////var ths = this;

		/**
		 * Id of parent
		 * @type {number}
		 */
		this.idOfWell = data.IdOfWell;

		/**
		 * Time in unix format, in seconds. Can not be changed (at this time)
		 * @type {number}
		 */
		this.unixTime = ko.observable(data.UnixTime);
    
    // TODO: dict as objects or as one observable object #HH!
	};

	return exports;
});
