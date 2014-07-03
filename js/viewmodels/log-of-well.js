/**
 * @module
 * @todo fix: select first log image (or from cookies - better) #ML!
 * @todo fix: edition for name and description #MH!
 * @todo fix: download file as extension (previos variant - above) #MM!
 * @todo style: decor for attribute selection #LM!
 * @todo fix: after removing files from the file manager - remove from all history records (reload history records) #MM!
 */
define(['knockout'], function (ko) {
	'use strict';

	// Download as ext
	// <li data-bind="visible: getExt() === 'png'" >
	// < a href =" #" data-bind= "click: function (data, event) { downloadAsExt('jpeg') }">Download as JPEG </a>
	// </ li>
	// < li data-bind =" visible: getExt() === 'png'">
	// < a href =" #" data-bind= "click: function (data, event) { downloadAsExt('tiff') }">Download as TIFF </a>
	// </ li>

	// byte[] imgByteArray = ImageHelper.ConvertBlobToByteArrayWithExt(blockBlob, ext);
	// HttpResponseMessage response = Request.CreateResponse();
	// response.Content = new ByteArrayContent(imgByteArray);
	// response.StatusCode = HttpStatusCode.OK;
	// response.Content.Headers.ContentType = new MediaTypeHeaderValue("image/" + ext);
	// response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
	// {
	// FileName = file_name.Replace(".png", "." + ext)
	// };

	/**
	 * Viewmodel: log of well
	 * @constructor
	 */
	var exports = function (mdlLogOfWell, koSlcVid) {

		var ths = this;

		/**
		 * Module: log of well
		 * @type {module:models/log-of-well}
		 */
		this.mdlLogOfWell = mdlLogOfWell;

		/**
		 * View guid
		 * @type {string}
		 */
		this.vid = mdlLogOfWell.id;

		/**
		 * Whether view is selected
		 * @type {boolean}
		 */
		this.isSlc = ko.computed({
				read : function () {
					return ths.vid === ko.unwrap(koSlcVid);
				},
				deferEvaluation : true
			});
	};

	return exports;
});
