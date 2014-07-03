define(function (require, exports, module) {
/**
 * @module models/test-data
 * @todo: feat: migrate to perfomance #MH!
 *        after approving test data - put this data to the perfomance table and graph
 *        when disapprove - remove this data from perfomance table and graph
 * @todo: refactor: last approved well test in well group table #MM!
 */

'use strict';

var $ = require('jquery');
var ko = require('knockout');
var testDataService = require('services/test-data');

/**
 * Model: test data - test record from test scope
 * @constructor
 */
exports = function (data, testScopeItem) {
	data = data || {};

	this.getTestScope = function () {
		return testScopeItem;
	};

	this.hourNumber = data.HourNumber;
	this.testScopeId = data.TestScopeId;
	this.comment = ko.observable(data.Comment);

	this.dict = data.Dict;

	this.isEdit = ko.observable(false);

	/**
	 * Data for cancelling saving
	 */
	this.cancelData = null;
};

/**
 * Go to edit mode
 */
exports.prototype.editTestData = function () {
	this.cancelData = {
		comment : ko.unwrap(this.comment),
		dict : $.extend({}, this.dict)
	};

	this.isEdit(true);
};

/**
 * Cancel edit mode
 */
exports.prototype.cancelEditTestData = function () {
	this.comment(this.cancelData.comment);
	this.dict = $.extend({}, this.cancelData.dict);
	this.isEdit(false);
};

/**
 * Handle saving
 * @private
 */
exports.prototype.cbkSaveTestData = function (response) {
	this.getTestScope().testDataListUpdateDate(new Date());
	this.comment(response.Comment);
	this.dict = response.Dict;
	this.isEdit(false);
};

/** Save a test record */
exports.prototype.saveTestData = function () {
	testDataService.put(this.testScopeId, this.hourNumber, ko.toJS(this))
	.done(this.cbkSaveTestData.bind(this));
};

module.exports = exports;

});