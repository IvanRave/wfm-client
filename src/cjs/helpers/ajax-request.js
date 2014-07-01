﻿/** @module helpers/ajax-request */
'use strict';

var $ = require('jquery');
var langHelper = require('helpers/lang-helper');
var loaderHelper = require('helpers/loader-helper');

var cbkAlways = function (marker) {
	loaderHelper.toggleLoadingState(false, marker);
};

var cbkFail = function (jqXHR, textStatus, errorThrown) {
	// TODO: include notification system: https://github.com/Nijikokun/bootstrap-notify
	switch (jqXHR.status) {
	case 401:
		////alert('Access is denied. Please re-login with right credentials.');

		////var currentHash = window.location.hash;
		////if (currentHash) {
		////    logonUrl += '?rurl=' + encodeURIComponent(currentHash.substring(1));
		////}
		////console.log('logurl', logonUrl);

		////window.location.href = logonUrl;
		break;
		////throw new Error('Access is denied');
	case 404:
		alert('Data is not found');
		break;
	case 422:
		// Business-logic errors
		// TODO: handle all 400 errors
		break;
	case 400:
		var resJson = jqXHR.responseJSON;
		console.log(resJson);
		if (resJson.errId === 'validationErrors') {
			// Show window - but modal window can be active already
			// TODO: make realization for all cases, or show in alert


			var errMsg = '{{capitalizeFirst lang.validationErrors}}:';
			$.each(resJson.modelState, function (stateKey, stateValue) {
				errMsg += '\n' + (langHelper.translate(stateKey) || stateKey) + ': ';

				$.each(stateValue, function (errIndex, errValue) {
					errMsg += langHelper.translateRow(errValue) + '; ';
				});
			});

			alert(errMsg);

			return;
		} else {
			console.log(resJson);
			alert(textStatus + ": " + jqXHR.responseText + ' (' + errorThrown + ')');
		}

		break;
	default:
		alert(textStatus + ": " + jqXHR.responseText + ' (' + errorThrown + ')');
		console.log(jqXHR);
	}
};

exports = function (type, url, data) {
	var options = {
		////dataType: "json",
		cache : false,
		type : type,
		xhrFields : {
			// For CORS request to send cookies
			withCredentials : true
		}
	};

	if (data) {
		// For CORS JSON request generate OPTION request
		// Default content-type = url-encoded string
		options.contentType = 'application/json; charset=utf-8';

		// all knockout models need contain toPlainJson function,
		// which converts knockout object to plain object (observables to plain objects etc.)
		if ($.isFunction(data.toPlainJson)) {
			////if (true) {
			////    try {
			////        options.data = $.param(data.toPlainJson());
			////    }
			////    catch (err) {
			////        console.log(err);
			////    }
			////}
			////else {
			options.data = JSON.stringify(data.toPlainJson());
			////}
		} else if ($.isArray(data)) {
			// each array element convert to plain json (it is not an appropriate way: would be better to convert each element to plain json before sending to ajaxRequest)
			// for other libraries (not knockout models - for plain JSON objects)
			options.data = JSON.stringify(data);
		} else {
			console.log('not ko object and not array');
			console.log(data);
			console.log(JSON.stringify(data));
			// for other libraries (not knockout models - for plain JSON objects)
			options.data = JSON.stringify(data);
		}

		// remove knockout dependency from this module
		////data: JSON.stringify(ko.toJS(data))
		////ko.toJSON(data)
	}

	// Generate time marker
	var marker = new Date().getTime();
	loaderHelper.toggleLoadingState(true, marker);

	return $.ajax(url, options)
	.fail(cbkFail)
	.always(cbkAlways.bind(null, marker));
};

module.exports = exports;
