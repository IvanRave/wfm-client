/** @module */
define(['knockout',
		'viewmodels/history-of-well'],
	function (ko,
		VwmHistoryOfWell) {
	'use strict';

	/**
	 * Well history view for history section, report section and history widgets
	 * @constructor
	 */
	var exports = function (vwmWell, koFilteredStartUnixTime, koFilteredEndUnixTime, koIdOfSlcJobType, koSortByDateOrder) {
		/**
		 * Getter for a parent viewmodel
		 *    Not defined as a property to exclude loop between a parent child and a child parent
		 */
		this.getVwmWell = function () {
			return vwmWell;
		};

		/**
		 * A well model
		 * @type {module:models/well}
		 */
		this.mdlWell = vwmWell.mdlStage;

		/** Company model for this well */
		var mdlCompany = this.mdlWell.getWellGroup().getWellField().getWellRegion().getCompany();

		/**
		 * Link to company job type list (observable)
		 */
		this.jobTypeList = mdlCompany.jobTypeList;

		this.goToPostingJobType = function () {
			var jobTypeNewName = window.prompt('{{capitalizeFirst lang.toAddJobTypeToList}}');
			if (jobTypeNewName) {
				mdlCompany.postJobType(jobTypeNewName);
			}
		};

		// UTC unix time (in seconds)
		this.startDate = koFilteredStartUnixTime;
		this.endDate = koFilteredEndUnixTime;

		this.jobTypeId = koIdOfSlcJobType;

		this.sortByDateOrder = koSortByDateOrder;

		this.sortByDateCss = ko.computed({
				read : this.getSortByDateCss,
				deferEvaluation : true,
				owner : this
			});

		this.listOfVwmHistoryOfWell = ko.computed({
				read : this.buildListOfVwmHistoryOfWell,
				deferEvaluation : true,
				owner : this
			}).trackHasItems();

		/**
		 * Sorted list of history records
		 *    Separated from main list, to prevent recreation of this list
		 * @type {Array.<module:viewmodels/history-of-well>}
		 */
		this.sortedListOfVwmHistoryOfWell = ko.computed({
				read : this.buildSortedListOfVwmHistoryOfWell,
				deferEvaluation : true,
				owner : this
			});

		this.wellHistoryNew = {
			startUnixTime : ko.observable(),
			endUnixTime : ko.observable()
		};

		/**
		 * Whether is a record posting enable
		 * @type {boolean}
		 */
		this.isEnabledPostHistoryOfWell = ko.computed({
				read : this.checkIsEnabledPostHistoryOfWell,
				deferEvaluation : true,
				owner : this
			});
	};

	/** Check whether is a record posting enable */
	exports.prototype.checkIsEnabledPostHistoryOfWell = function () {
		if (ko.unwrap(this.wellHistoryNew.startUnixTime)) {
			return true;
		} else {
			return false;
		}
	};

	/** Create a history record */
	exports.prototype.postVwmHistoryOfWell = function () {
		var ths = this;
		if (ko.unwrap(this.isEnabledPostHistoryOfWell)) {
			var wellHistoryNewData = ko.toJS(this.wellHistoryNew);

			if (wellHistoryNewData.startUnixTime) {
				if (!wellHistoryNewData.endUnixTime) {
					wellHistoryNewData.endUnixTime = wellHistoryNewData.startUnixTime;
				}

				this.mdlWell.postHistoryOfWell(wellHistoryNewData.startUnixTime,
					wellHistoryNewData.endUnixTime, function () {
					// Set to null for psblty creating new well history
					ths.wellHistoryNew.startUnixTime(null);
					ths.wellHistoryNew.endUnixTime(null);
				});
			}
		}
	};

	/**
	 * Remove history record: model and viewmodel
	 */
	exports.prototype.removeVwmHistoryOfWell = function (vwmHistoryOfWellToRemove) {
		if (confirm('{{capitalizeFirst lang.confirmToDelete}} record?')) {
			this.mdlWell.deleteWellHistory(vwmHistoryOfWellToRemove.mdlHistoryOfWell);
		}
	};

	/**
	 * Get sorted list
   * @private
	 */
	exports.prototype.buildSortedListOfVwmHistoryOfWell = function () {
		var tmpVwmList = ko.unwrap(this.listOfVwmHistoryOfWell);

		var tmpOrder = parseInt(ko.unwrap(this.sortByDateOrder), 10);

		return tmpVwmList.sort(function (left, right) {
			return ko.unwrap(left.mdlHistoryOfWell.startUnixTime) === ko.unwrap(right.mdlHistoryOfWell.startUnixTime) ? 0 :
			(ko.unwrap(left.mdlHistoryOfWell.startUnixTime) > ko.unwrap(right.mdlHistoryOfWell.startUnixTime) ? tmpOrder : -tmpOrder);
		});
	};

	/** Get list of viewmodels */
	exports.prototype.buildListOfVwmHistoryOfWell = function () {
		var tmpMdlList = ko.unwrap(this.mdlWell.historyList);
		var readyList = tmpMdlList.map(function (elem) {
			return new VwmHistoryOfWell(elem,
				this.getVwmWell(),
				this.startDate,
				this.endDate,
				this.jobTypeId);
		}, this);
    
    console.log('Ready history list:', readyList);
    return readyList;
	};

	/** Get css for the button with a date filter */
	exports.prototype.getSortByDateCss = function () {
		return ko.unwrap(this.sortByDateOrder) === 1 ? 'glyphicon-arrow-down' : 'glyphicon-arrow-up';
	};

	/** Change a sort order */
	exports.prototype.changeSortByDateOrder = function () {
		this.sortByDateOrder(-parseInt(ko.unwrap(this.sortByDateOrder), 10));
	};

	return exports;
});
