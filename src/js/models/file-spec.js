/**
 * @module
 * @todo #33! Update filter by typing with delay
 *       update knockout to 3.1 firstly with a new method
 */
define(['knockout',
		'moment',
    'helpers/app-helper'],
	function (ko,
		appMoment,
    appHelper) {
	'use strict';

	/**
	 * File specification
	 * @param {object} data - File specification data
	 * @constructor
	 */
	var exports = function (data) {
		data = data || {};

		/**
		 * File guid
		 * @type {string}
		 */
		this.id = data.Id;

		/**
		 * File url: generating on the server
		 * @type {string}
		 */
		this.fileUrl = data.FileUrl;

		/**
		 * File name (255)
		 * @type {string}
		 */
		this.name = ko.observable(data.Name);

		/**
		 * File extension
		 * @type {string}
		 */
		this.extension = data.Extension;

		/**
		 * Content type
		 * @type {string}
		 */
		this.contentType = data.ContentType;

		/**
		 * File creation datetime, unix timestamp, in seconds
		 * @type {number}
		 */
		this.createdUnixTime = data.CreatedUnixTime;

		/**
		 * File size, bytes,
		 * @type {number}
		 */
		this.length = data.Length;

		/**
		 * Image width, in pixels (null for non-images)
		 * @type {number}
		 */
		this.imgWidth = data.ImgWidth;

		/**
		 * Image height, in pixels (null for non-images)
		 * @type {number}
		 */
		this.imgHeight = data.ImgHeight;

		/**
		 * File size, kilobytes
		 * @type {number}
		 */
		this.lengthInKb = parseInt(this.length / 1024, 10);

		/////**
		////* Image ratio, like 3*4 (null for non-images)
		////* @type {number}
		////*/
		////this.imgRatio = (ths.imgHeight && ths.imgWidth) ? (ths.imgWidth / ths.imgHeight) : null;

		/**
		 * Full file decription for files on small screen
		 * @type {string}
		 */
		this.fullTitle = 'Size: ' + this.length +
			' bytes\nExtension: ' + this.extension +
			'\nCreated: ' + appMoment(this.createdUnixTime * 1000).format('YYYY-MM-DD HH:mm:ss');

		/** Name plus extension */
		this.namePlusExtension = ko.computed({
				read : this.calcNamePlusExtension,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Whether file is selected (in file manager): TODO: create view for non-model properties
		 * @type {boolean}
		 */
		this.isSelected = ko.observable(false);
	};

	/** Calculate a full name of the file */
	exports.prototype.calcNamePlusExtension = function () {
		return ko.unwrap(this.name) + ko.unwrap(this.extension);
	};

	/** Convert to plain js */
	exports.prototype.toPlainFileSpec = function () {
		return {
			Id : this.id,
			Name : ko.unwrap(this.name),
			Extension : ko.unwrap(this.extension),
			CreatedUnixTime : ko.unwrap(this.createdUnixTime),
			Length : ko.unwrap(this.length),
      ImgWidth: ko.unwrap(this.imgWidth),
      ImgHeight: ko.unwrap(this.imgHeight)
		};
	};
  
  /** Download file */
	exports.prototype.download = function () {
		appHelper.downloadURL(this.fileUrl);
	};

	return exports;
});
