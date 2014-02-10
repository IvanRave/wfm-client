/** @module */
define([
		'jquery',
		'knockout',
		'moment',
		'models/test-data',
		'services/test-data',
    'services/test-scope'],
	function ($,
		ko,
		appMoment,
		TestData,
		testDataService,
    testScopeService) {
	'use strict';

	function importTestDataDtoList(data, testScopeItem) {
		return (data || []).map(function (item) {
			return new TestData(item, testScopeItem);
		});
	}

	/**
	 * Model: test scope - parent of test records (test data)
	 * @constructor
	 */
	var exports = function (data, wellItem) {
		var self = this;
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

		this.setIsApproved = function (isApprovedVal) {
			self.isApproved(isApprovedVal);
      testScopeService.put(self.id, self.toPlainJson());
		};

		this.startUnixTimeDateView = ko.computed({
				read : function () {
					return appMoment(self.startUnixTime() * 1000).format('YYYY-MM-DD HH:mm');
				},
				deferEvaluation : true
			});

		this.testDataList = ko.observableArray();

		this.addTestData = function () {
			testDataService.post({
				Comment : '',
				HourNumber : ko.unwrap(self.testDataList).length,
				TestScopeId : self.id,
				Dict : {}
			}).done(function (response) {
				self.testDataList.push(new TestData(response, self));
			});
		};

		this.deleteTestData = function (testDataItem) {
			if (confirm('{{capitalizeFirst lang.confirmToDelete}}?') === true) {
        testDataService.remove(testDataItem.testScopeId, testDataItem.hourNumber).done(function () {
					self.testDataList.remove(testDataItem);
				});
			}
		};

		this.testDataListUpdateDate = ko.observable(new Date());

		// contains total for test data list dictionary properties
		// total - AVE or SUM (for day)
		this.testDataTotal = ko.computed({
				read : function () {
					var result = {};
					if (self.testDataList().length > 0) {
						// check for release computed value
						if (self.testDataListUpdateDate()) {
							$.each(ko.unwrap(self.getWell().getWellGroup().listOfWfmParameterOfWroup), function (paramIndex, paramValue) {
								var tempArr = [];
								$.each(self.testDataList(), function (testDataIndex, testDataValue) {
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
				},
				deferEvaluation : true
			});

		this.toPlainJson = function () {
			var copy = ko.toJS(self);
			delete copy.startUnixTimeDateView;
			delete copy.testDataTotal;
			delete copy.testDataListUpdateDate;
			return copy;
		};

		// fill test data list
		this.testDataList(importTestDataDtoList(data.TestDataDtoList, self));
	};

	return exports;
});
