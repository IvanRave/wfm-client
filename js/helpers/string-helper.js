/** @module */
define([], function () {
	'use strict';

	var exports = {};

	exports.endsWith = function (str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	};

	exports.startsWith = function (str, suffix) {
		return str.indexOf(suffix) === 0;
	};

	exports.trimLeft = function (str) {
		return str.replace(/^\s+/, '');
	};

	exports.trimRight = function (str) {
		return str.replace(/\s+$/, '');
	};

	exports.capitalizeFirst = function (str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};

	exports.isGuidValid = function (guidValue) {
		return (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).test(guidValue);
	};

	return exports;
});
