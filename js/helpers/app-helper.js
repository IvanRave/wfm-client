define(function (require, exports, module) {
/** @module helpers/app-helper */
'use strict';

/**
 * Convert to int
 */
exports.toInt = function (val) {
	// May be some additional checking
	return parseInt(val);
};

/**
 * Convert to float
 * @param (number} value 123.
 * @param {number} countAfterPeriod .524
 */
exports.toFloatDec = function (value, countAfterPeriod) {
	return exports.toInt(value * Math.pow(10, countAfterPeriod)) / Math.pow(10, countAfterPeriod);
};

/**
 * Whether is value numeric
 *    https://api.jquery.com/jQuery.isNumeric/
 * @returns {boolean}
 */
exports.isNumeric = function (obj) {
	// From jquery
	// // May be additional check
	// parseFloat NaNs numeric-cast false positives (null|true|false|"")
	// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
	// subtraction forces infinities to NaN
	return obj - parseFloat(obj) >= 0;
	// return $.isNumeric(value);
};

/**
 * Whether the value is function
 * @returns {boolean}
 */
exports.isFunction = function (possibleFunc) {
	// http://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
	return (typeof(possibleFunc) === 'function');
	//return $.isFunction(possibleFunc);
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
		return stringArr.map(function (elemValue) {
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

/**
 * Get element from list by property value: element with property [propName] equals [propValue]
 */
exports.getElementByPropertyValue = function (elemList, propName, propValue) {
	var needElemValue = null;

	if (propName) {
		elemList.forEach(function (elemValue) {
			if (elemValue[propName] === propValue) {
				needElemValue = elemValue;
			}
		});
	}

	return needElemValue;
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

module.exports = exports;

});