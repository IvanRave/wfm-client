/** @module */
define(['knockout'], function (ko) {
	'use strict';

	/**
	 * Pre file
	 * @constructor
	 * @param {string} optName - A name of the file
	 * @param {number} optSize - A size of the file
	 * @param {string} optContentType - A type of the file
   * @param {Object} dataProgress - Changed automatically
	 */
	var exports = function (optName, optSize, optContentType, dataProgress) {
		/**
		 * A name of the file
		 * @type {string}
		 */
		this.name = optName;

		/**
		 * A size of the file
		 * @type {number}
		 */
		this.size = optSize;

		/**
		 * A content type of the file
		 * @type {string}
		 */
		this.contentType = optContentType;
    
    /**
		 * Progress of uploading, percents
		 * @type {number}
		 */
		this.progress = ko.observable(dataProgress);

    // computed
    //this.parseInt(data.loaded / data.total * 100, 10);    
	};

	return exports;
});
