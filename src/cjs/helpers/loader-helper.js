/** @module helpers/loader-helper */

var $ = require('jquery');

var queueArr = [];

var cbkShowLoader = function (jqrLoaderMain) {
	if (queueArr.length > 0) {
		jqrLoaderMain.show();
	}
};

/**
 * Turn on/off the main loader
 *    If request time is less then 1 second - don't show the loader
 *    If few requests in one moment - show the loader only once
 *    Queue of requests: add time mark (instead random) to the queue for every request
 *    Remove this time mark when needed
 *    Show loader if this array is not empty
 * @param {number} marker - time marker, id of the request
 */
exports.toggleLoadingState = function (isOn, marker) {
	var jqrLoaderMain = $('#loader-main');
	if (isOn) {
		// Only if this is the first request per queue
		if (queueArr.length === 0) {
			if (jqrLoaderMain.is(':visible') === false) {
				// Add timer: if after some period queueArr is not empty then run
				window.setTimeout(cbkShowLoader.bind(null, jqrLoaderMain), 500);
			}
		}

		queueArr.push(marker);
	} else {
		var index = queueArr.indexOf(marker);
		if (index > -1) {
			queueArr.splice(index, 1);
		}

		if (queueArr.length === 0) {
			if (jqrLoaderMain.is(':visible') === true) {
				jqrLoaderMain.hide();
			}
		}
	}
};

module.exports = exports;
