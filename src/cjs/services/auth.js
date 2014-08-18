/** @module services/auth */

'use strict';

var ajaxRequest = require('helpers/ajax-request');

function sessionOfUserUrl() {
	return '{{conf.requrl}}/api/account/session';
}

function accountFullLogOffUrl(redirectUri) {
	return '{{conf.authUrl}}/account/logout' + '?redirect_uri=' + redirectUri;
}

/** Auth service */
exports = {};

/** Get account info */
exports.getUserProfile = function () {
	return ajaxRequest('GET', sessionOfUserUrl());
};

/** End the session */
exports.accountLogOff = function () {
	return ajaxRequest('DELETE', sessionOfUserUrl());
};

var cbkAuthInterval = function (redirectUri, authScope, next) {
	var authLocation = authScope.authWindow.location;

	var authLocationHref;
	// Uncaught SecurityError: Blocked a frame with origin "http://localhost:12345" from accessing
	// a frame with origin "http://localhost:1337". Protocols, domains, and ports must match.
	try {
		authLocationHref = authLocation.href;
	} catch (errSecurity) {}

	console.log(authLocationHref);

	if (authLocationHref) {
		var hrefParts = authLocationHref.split('?');

		// if https://some.ru -> //some.ru
		if (hrefParts[0].indexOf(redirectUri) >= 0) {
			// Get code or error
			var authResponse = hrefParts[1];

			clearInterval(authScope.authInterval);
			// Close popup
			authScope.authWindow.close();

			next(authResponse);
		}
	}
};

/** End the WFM session and Petrohelp session */
exports.accountFullLogOff = function (next) {
	// create a window with Petrohelp logout url
	// Automatically logout (GET or POST)
	// Close the window

	var authScope = {
		authWindow : null,
		authInterval : null
	};

	var redirectUri = '{{conf.redirectUriOfAuthLogOff}}';

	authScope.authInterval = setInterval(cbkAuthInterval.bind(null, redirectUri, authScope, next), 1000);

	authScope.authWindow = window.open(accountFullLogOffUrl(redirectUri),
			'_blank',
			'location=yes,height=570,width=520,scrollbars=yes,status=yes');

	// Alternative
	// Redirect to Petrohelp logout page
	// Press a Logout button
	// Get success response
	// Back redirect to the service
};

exports.accountLogOn = function (next) {
	var idOfAuthClient = '{{conf.idOfAuthClient}}';
	var redirectUri = '{{conf.redirectUriOfAuthClient}}';

	// Object to catch changes in bind method
	var authScope = {
		authWindow : null,
		authInterval : null
	};

	authScope.authInterval = setInterval(cbkAuthInterval.bind(null, redirectUri, authScope, next), 1000);

	authScope.authWindow = window.open('{{conf.authUrl}}' + '/dialog/authorize?response_type=code&client_id=' + idOfAuthClient + '&redirect_uri=' + redirectUri,
			'_blank',
			'location=yes,height=570,width=520,scrollbars=yes,status=yes');
};

module.exports = exports;
