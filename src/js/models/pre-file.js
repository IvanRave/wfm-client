/** @module */
define(['knockout'], function (ko) {
	'use strict';

	/**
	 * Pre file
	 * @constructor
	 * @param {string} optName - A name of the file
	 * @param {number} optSize - A size of the file
	 * @param {string} optContentType - A type of the file
	 */
	var exports = function (optName, optSize, optContentType, regExpString, maxSizeOfFile, abortFunction) {
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
		 * File size, kilobytes
		 * @type {number}
		 */
		this.sizeInKb = parseInt(this.size / 1024, 10);

		/**
		 * A content type of the file
		 * @type {string}
		 */
		this.contentType = optContentType;

		/**
		 * Progress of uploading, percents
		 * @type {number}
		 */
		this.progressPercent = ko.observable(0);

		/**
		 * A string, like 60% for a bar title and a width property
		 * @type {string}
		 */
		this.progressPercentString = ko.computed({
				read : this.calcProgressPercentString,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Max size of a file, in bytes
		 * @type {number}
		 */
		this.maxSize = maxSizeOfFile;

		/**
		 * A regular expression string for type
		 * @type {string}
		 */
		this.regExpString = regExpString;

		/**
		 * A string of supported types
		 * @type {string}
		 */
		this.supportedTypes = this.regExpString.replace(/[\\,\$,\^]/g, '').split('|').join(', ');

		/**
		 * Whether is type of file is success
		 * @type {boolean}
		 */
		this.isSuccessType = new RegExp(this.regExpString).test(this.contentType) === true;

		/**
		 * Whether tht size of file is success
		 * @type {boolean}
		 */
		this.isSuccessSize = this.size <= this.maxSize;

		/**
		 * Whether this file is succes for adding to the list of file
		 * @type {boolean}
		 */
		this.isSuccess = this.isSuccessSize && this.isSuccessType;

		/** Abort uploading */
		this.abortUploading = function () {
			abortFunction();
			// remove this pre-file
		};
	};

	/** Calculate string of percent */
	exports.prototype.calcProgressPercentString = function () {
		return ko.unwrap(this.progressPercent) + '%';
	};

	return exports;
});
