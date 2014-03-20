/** @module */
define(['jquery'], function ($) {
	'use strict';

	var exports = {};

	/**
	 * Whether is value numeric
	 *    https://api.jquery.com/jQuery.isNumeric/
	 * @returns {boolean}
	 */
	exports.isNumeric = function (value) {
		// may be additional check
		return $.isNumeric(value);
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

	// result example: 12,32 43,12 43,54
	exports.twoDimArrayToString = function (twoDimArray) {
		for (var i = 0, iMax = twoDimArray.length; i < iMax; i += 1) {
			if (twoDimArray[i]instanceof Array) {
				twoDimArray[i] = twoDimArray[i].join(',');
			}
		}

		return twoDimArray.join(' ');
	};

	// result example [[12,32] [42,12] [43,54]]
	exports.stringToTwoDimArray = function (stringArray) {
		var oneDimArray = stringArray.split(' ');
		// result = ["12.3,324", "1234,53.45"]

		function getNumberArray(stringArr) {
			return $.map(stringArr, function (elemValue) {
				return +elemValue;
			});
		}

		var twoDimArray = [];
		for (var i = 0, iLimit = oneDimArray.length; i < iLimit; i += 1) {
			// Split result = ["1234", "234.3"]
			twoDimArray.push(getNumberArray(oneDimArray[i].split(',')));
		}

		return twoDimArray;
	};

	// Get area in square units
	exports.getArea = function (arr) {
		var arrLength = arr.length;
		if (arrLength < 3) {
			return 0;
		}
		// set overlast element
		arr.push([arr[0][0], arr[0][1]]);

		var area = 0;
		for (var i = 0; i < arrLength; i += 1) {
			area = area + (arr[i][0] * arr[i + 1][1] - arr[i][1] * arr[i + 1][0]);
		}

		return Math.abs(area / 2);
	};

	/**
	 * Get list of years
	 * @returns {Array}
	 */
	exports.getYearList = function (startYear, endYear) {
		var tempArr = [];

		for (var i = startYear; i <= endYear; i += 1) {
			tempArr.unshift(i);
		}

		return tempArr;
	};

	exports.capitalizeFirst = function (str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};

	/**
	 * Get element from list by property value: element with property [propName] equals [propValue]
	 */
	exports.getElementByPropertyValue = function (elemList, propName, propValue) {
		var needElemValue = null;

		if (propName) {
			$.each(elemList, function (elemIndex, elemValue) {
				if (elemValue[propName] === propValue) {
					// Find elem
					needElemValue = elemValue;
					// Exit from this cycle
					return false;
				}

				// Continue this cycle
				return true;
			});
		}

		return needElemValue;
	};

	exports.isGuidValid = function (guidValue) {
		return (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).test(guidValue);
	};

	/**
	 * Inherit the prototype methods from one constructor into another.
	 * @example
	 * Usage:
	 * <pre>
	 * function ParentClass(a, b) { }
	 * ParentClass.prototype.foo = function(a) { }
	 *
	 * function ChildClass(a, b, c) {
	 *   goog.base(this, a, b);
	 * }
	 * goog.inherits(ChildClass, ParentClass);
	 *
	 * var child = new ChildClass('a', 'b', 'see');
	 * child.foo(); // This works.
	 * </pre>
	 *
	 * In addition, a superclass' implementation of a method can be invoked as
	 * follows:
	 *
	 * <pre>
	 * ChildClass.prototype.foo = function(a) {
	 *   ChildClass.superClass_.foo.call(this, a);
	 *   // Other code here.
	 * };
	 * </pre>
	 *
	 * @param {Function} childCtor Child class.
	 * @param {Function} parentCtor Parent class.
	 */
	exports.inherits = function (childCtor, parentCtor) {
		function TempCtor() {}
		TempCtor.prototype = parentCtor.prototype;
		childCtor.superClass_ = parentCtor.prototype;
		childCtor.prototype = new TempCtor();
		/** @override */
		childCtor.prototype.constructor = childCtor;
	};

	return exports;
});
