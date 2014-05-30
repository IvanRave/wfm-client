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
	var self = this;
	data = data || {};

	this.getTestScope = function () {
		return testScopeItem;
	};

	this.hourNumber = data.HourNumber;
	this.testScopeId = data.TestScopeId;
	this.comment = ko.observable(data.Comment);

	this.dict = data.Dict;

	this.isEdit = ko.observable(false);

	var cancelData;
	this.editTestData = function () {
		cancelData = {
			comment : self.comment(),
			dict : $.extend({}, self.dict)
		};

		self.isEdit(true);
	};

	this.saveTestData = function () {
		testDataService.put(self.testScopeId, self.hourNumber, ko.toJS(self)).done(function (response) {
			self.getTestScope().testDataListUpdateDate(new Date());
			self.comment(response.Comment);
			self.dict = response.Dict;
			self.isEdit(false);
		});
	};

	this.cancelEditTestData = function () {
		self.comment(cancelData.comment);
		self.dict = $.extend({}, cancelData.dict);
		self.isEdit(false);
	};
};

module.exports = exports;
