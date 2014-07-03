/**
 * @module
 * @returns {!Object} Scope of methods to help working with files.
 */
define(['jquery', 'jquery.fileupload'], function () {
	'use strict';

	var exports = {};

	exports.initRegExpFileUpload = function (jqrElem, url, addCallback) {
		jqrElem.fileupload({
			url : url,
			autoUpload : false,
			dataType : 'json',
			xhrFields : {
				// For CORS request to send cookies
				withCredentials : true
			},
			add : function (e, data) {
				addCallback(data);
			}
		});

		// Use 'add' property instead,
		// this binding is uploaded file even if returns false
		// .bind('fileuploadadd', function (e, data) {
		// addCallback(data);
		// });

		// Enable iframe cross-domain access via redirect option:
		////$('#'+inputName).fileupload(
		////    'option',
		////    'redirect',
		////    window.location.href.replace(
		////        /\/[^\/]*$/,
		////        '/cors/result.html?%s'
		////    )
		////);
	};

	// Hidden Iframe for file loading (to the client comp)
	exports.downloadURL = function (url) {
		var hiddenIFrameID = 'hiddenDownloader';
		var iframe = document.getElementById(hiddenIFrameID);
		if (iframe === null) {
			iframe = document.createElement('iframe');
			iframe.id = hiddenIFrameID;
			iframe.style.display = 'none';
			document.body.appendChild(iframe);
		}

		iframe.src = url;
	};

	return exports;
});
