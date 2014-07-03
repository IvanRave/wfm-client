/** @module */
define(['knockout', 'models/wfm-parameter'], function (ko, WfmParameter) {
	'use strict';

	function importWfmParameterDtoList(data) {
		return (data || []).map(function (item) {
			return new WfmParameter(item);
		});
	}

	/**
	 * Wfm param squad
	 * @constructor
	 */
	var exports = function (data) {
		
		data = data || {};

		this.id = data.Id;

		this.wfmParameterList = ko.observableArray();

		this.toPlainJson = function () {
			return ko.toJS(this);
		};

		// Set list of well file manager parameters to group (if exists)
		// Get requests for squads can be inclusive and non-inclusive: if inclusive then this list exists
		if (data.WfmParameterDtoList) {
			this.wfmParameterList(importWfmParameterDtoList(data.WfmParameterDtoList));
		}
	};

	return exports;
});
