/** 
 * @return {!Object} Scope of methods to help working with files.
*/
define(['jquery', 'jquery.fileupload'], function ($) {
    'use strict';

    return {
        initRegExpFileUpload: function (inputName, url, fileTypeRegExp, callbackFunction) {
            $(inputName).fileupload({
                url: url,
                xhrFields: {
                    // For CORS request to send cookies
                    withCredentials: true
                },
                add: function (e, data) {
                    if (data.files[0].size > 10485760) {
                        alert('Max size of file: 10MB (' + data.files[0].name + ')');
                        return;
                    }

                    var contentTypeOfFile = data.files[0].type;

                    if (new RegExp(fileTypeRegExp).test(contentTypeOfFile) === false) {
                        // Alert. Remove metacharacters from regexp and divide to normal representation
                        alert(data.files[0].name + ': file type is not supported. Supported types: ' + fileTypeRegExp.replace(/[\\,\$,\^]/g, '').split('|').join(', '));
                        return;
                    }

                    data.submit()
                    .success(callbackFunction)
                    .error(function (jqXHR, textStatus, errorThrown) {
                        alert(textStatus + ': ' + jqXHR.responseText + ' (' + errorThrown + ')');
                    });
                    ////.complete(function (result, textStatus, jqXHR) { alert('complete'); });
                    ////
                }
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
});