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
	var exports = function (optName, optSize, optContentType, regExpString, maxSizeOfFile, abortCallback) {
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
		 * File size, kilobytes (2 after point)
		 * @type {number}
		 */
		this.sizeInKb = parseInt((this.size * 100) / 1024, 10) / 100;

    /**
    * File size, megabytes
    * @type {number}
    */
    this.sizeInMb = parseInt((this.size * 100) / 1024 / 1024, 10) / 100;
    
		/**
		 * A content type of the file
		 * @type {string}
		 */
		this.contentType = optContentType;

    /**
    * Count of loaded bytes
    * @type {number}
    */
    this.bytesLoaded = ko.observable(0);
    
    /**
    * Loaded in KB
    * @type {number}
    */
    this.bytesLoadedInKb = ko.computed({
      read: this.calcBytesLoadedInKb,
      deferEvaluation: true,
      owner: this
    });
    
		/**
		 * Progress of uploading, percents
		 * @type {number}
		 */
		this.progressPercent = ko.computed({
      read: this.calcProgressPercent,
      deferEvaluation: true,
      owner: this
    });

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
      console.log('abort callback');
			abortCallback();
			// remove this pre-file
		};
	};

  /** Calculate percent of loading progress */
  exports.prototype.calcProgressPercent = function(){
    return parseInt((ko.unwrap(this.bytesLoaded) / this.size) * 100, 10);
  };
  
  /** 
  * Calculate a loading progress in KB (123.45)
  * @returns {number}
  */
  exports.prototype.calcBytesLoadedInKb = function(){
    return (parseInt((ko.unwrap(this.bytesLoaded) / 1024) * 100, 10) / 100);
  };
  
	/** Calculate string of percent */
	exports.prototype.calcProgressPercentString = function () {
		return ko.unwrap(this.progressPercent) + '%';
	};
  
	return exports;
});
