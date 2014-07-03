/** @module */
define(['knockout', 'models/file-spec'], function (ko, FileSpec) {
	'use strict';

	/**
	 * Model: nodal analysis of well
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
		 * Guid of file specification: can not be changed - only re-creation whole object
		 * @type {string}
		 */
		this.idOfFileSpec = data.IdOfFileSpec;

		/**
		 * Name
		 * @type {string}
		 */
		this.name = ko.observable(data.Name);

		/**
		 * Description
		 * @type {string}
		 */
		this.description = ko.observable(data.Description);

		/**
		 * File specification
		 * @type {module:models/file-spec}
		 */
		this.fileSpec = new FileSpec(data.FileSpecDto);
	};

	return exports;
});