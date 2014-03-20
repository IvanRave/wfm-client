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
        autoUpload: false,
        dataType: 'json',
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
		}
	};

	return exports;
});
