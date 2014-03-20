/**
 * @module
 * @returns {!Object} Scope of methods to help working with files.
 */
define(['jquery', 'jquery.fileupload'], function () {
	'use strict';

	var exports = {
		initRegExpFileUpload : function (jqrElem, url, addCallback) {
			jqrElem.fileupload({
				url : url,
				xhrFields : {
					// For CORS request to send cookies
					withCredentials : true
				}
			})
			.bind('fileuploadadd', function (e, data) {
				addCallback(data);
			});

			// Enable iframe cross-domain access via redirect option:
			////$('#'+inputName).fileupload(
			////    'option',
			////    'redirect',
			////    window.location.href.replace(
			////        /\/[^\/]*$/,
			////        '/cors/result.html?%s'
			////    )
			////);
		}
	};

	return exports;
});
