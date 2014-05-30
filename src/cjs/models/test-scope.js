/** @module models/test-scope */
'use strict';

var $ = require('jquery');
var ko = require('knockout');
var appMoment = require('moment');
var TestData = require('models/test-data');
var testDataService = require('services/test-data');
var testScopeService = require('services/test-scope');

function importTestDataDtoList(data, testScopeItem) {
	return (data || []).map(function (item) {
		return new TestData(item, testScopeItem);
	});
}

/**
 * Model: test scope - parent of test records (test data)
 * @constructor
 */
exports = function (data, wellItem) {
	var ths = this;

	data = data || {};

	this.getWell = function () {
		return wellItem;
	};

	// Guid
	this.id = data.Id;
	this.wellId = data.WellId;
	this.startUnixTime = ko.observable(data.StartUnixTime);
	this.isApproved = ko.observable(data.IsApproved);
	this.conductedBy = ko.observable(data.ConductedBy);
	this.certifiedBy = ko.observable(data.CertifiedBy);

	this.startUnixTimeDateView = ko.computed({
			read : function () {
				return appMoment(ko.unwrap(ths.startUnixTime) * 1000).format('YYYY-MM-DD HH:mm');
			},
			deferEvaluation : true
		});

	this.testDataList = ko.observableArray();

	this.testDataListUpdateDate = ko.observable(new Date());

	// contains total for test data list dictionary properties
	// total - AVE or SUM (for day)
	this.testDataTotal = ko.computed({
			read : this.calcTestDataTotal,
			deferEvaluation : true,
			owner : this
		});

	// fill test data list
	this.testDataList(importTestDataDtoList(data.TestDataDtoList, ths));
};

/*
 * Save a test scope
 */
exports.prototype.saveTestScope = function () {
	testScopeService.put(this.id, this.toPlainJson());
};

/** Convert to plain JSON object */
exports.prototype.toPlainJson = function () {
	var copy = ko.toJS(this);
	delete copy.startUnixTimeDateView;
	delete copy.testDataTotal;
	delete copy.testDataListUpdateDate;
	return copy;
};

/**
 * Remove from cur array
 */
exports.prototype.unsetTestData = function (testDataItem) {
	this.testDataList.remove(testDataItem);
};

/**
 * Add to an array
 */
exports.prototype.setTestData = function (response) {
	this.testDataList.push(new TestData(response, this));
};

/**
 * Delete a test record
 */
exports.prototype.deleteTestData = function (testDataItem) {
	if (confirm('{{capitalizeFirst lang.confirmToDelete}}?') === true) {
		testDataService.remove(testDataItem.testScopeId, testDataItem.hourNumber)
		.done(this.unsetTestData.bind(this, testDataItem));
	}
};

/** Create a test record */
exports.prototype.addTestData = function () {
	testDataService.post({
		Comment : '',
		HourNumber : ko.unwrap(this.testDataList).length,
		TestScopeId : this.id,
		Dict : {}
	}).done(this.setTestData.bind(this));
};

/**
 * Approve test
 */
exports.prototype.setStatusToApproved = function () {
	this.isApproved(true);
	this.saveTestScope();
};

/**
 * Decline test
 */
exports.prototype.setStatusToDeclined = function () {
	this.isApproved(false);
	this.saveTestScope();
};

/**
 * Clear declined of approved status of this test
 */
exports.prototype.setStatusToNull = function () {
	this.isApproved(null);
	this.saveTestScope();
};

/** Calculate total row */
exports.prototype.calcTestDataTotal = function () {
	var result = {};
	if (ko.unwrap(this.testDataList).length > 0) {
		// check for release computed value
		if (ko.unwrap(this.testDataListUpdateDate)) {
			var ths = this;
			$.each(ko.unwrap(ths.getWell().getWellGroup().listOfWfmParameterOfWroup), function (paramIndex, paramValue) {
				var tempArr = [];
				$.each(ths.testDataList(), function (testDataIndex, testDataValue) {
					if (typeof testDataValue.dict[paramValue.wfmParameterId] !== "undefined" && testDataValue.dict[paramValue.wfmParameterId] !== null) {
						tempArr.push(parseFloat((testDataValue.dict[paramValue.wfmParameterId])));
					}
				});

				if (tempArr.length > 0) {
					var sum = tempArr.reduce(function (a, b) {
							return a + b;
						});
					result[paramValue.wfmParameterId] = parseFloat(sum / tempArr.length).toFixed(2);
					if (ko.unwrap(paramValue.wfmParameter().isCumulative) === true) {
						result[paramValue.wfmParameterId] *= 24;
					}
				}
			});
		}
	}

	return result;
};

module.exports = exports;
