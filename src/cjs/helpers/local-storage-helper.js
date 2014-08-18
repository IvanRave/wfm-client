/** @module helpers/local-storage-helper */

'use strict';

/**
 * Get an item from a storage
 * @param {String} name - Name of an item
 */
exports.getItem = function (name) {
	return window.localStorage.getItem(name);

	// return hlpr.getCookies[name];
};

/**
 * Add an item to a storage
 * @param {String} name - Name of an item
 * @param {String} value - Value of an item, only string
 * @param {Boolean} isPersistent - Whether the item is persistent or only this session
 */
exports.setItem = function (name, value, isPersistent) {
	var strg;
	if (isPersistent) {
		strg = window.localStorage;
	} else {
		strg = window.sessionStorage;
	}

	strg.setItem(name, value);
	// var expires = '';
	// if (days) {
	// var date = new Date();
	// date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
	// expires = '; expires=' + date.toGMTString();
	// }

	////document.cookie = name + '=' + value + expires + '; path=/';
};

/**
 * Remove an item
 * @param {String} name - Name
 */
exports.removeItem = function (name) {
	window.localStorage.removeItem(name);
	// document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
};

module.exports = exports;

// // hlpr.getCookies = function () {
// // var c = document.cookie,
// // v = 0,
// // cookies = {};
// // if (document.cookie.match(/^\s*\$Version=(?:"1"|1);\s*(.*)/)) {
// // c = RegExp.$1;
// // v = 1;
// // }
// // if (v === 0) {
// // c.split(/[,;]/).map(function (cookie) {
// // var parts = cookie.split(/=/, 2),
// // name = decodeURIComponent(stringHelper.trimLeft(parts[0])),
// // value = parts.length > 1 ? decodeURIComponent(stringHelper.trimRight(parts[1])) : null;
// // cookies[name] = value;
// // });
// // } else {
// // c.match(/(?:^|\s+)([!#$%&'*+\-.0-9A-Z^`a-z|~]+)=([!#$%&'*+\-.0-9A-Z^`a-z|~]*|"(?:[\x20-\x7E\x80\xFF]|\\[\x00-\x7F])*")(?=\s*[,;]|$)/g).map(function ($0, $1) {
// // var name = $0,
// // value = $1.charAt(0) === '"' ? $1.substr(1, -1).replace(/\\(.)/g, "$1") : $1;
// // cookies[name] = value;
// // });
// // }
// // return cookies;
// // };
