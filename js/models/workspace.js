/** @module
 * todo: #22! handle to remove
 *       this.setUserProfile
 *       this.cleanUserProfile
 */
define([
		'knockout',
		'helpers/app-helper',
		'models/user-profile',
		'models/section-pattern',
		'services/section-pattern',
		'models/wfm-param-squad',
		'services/wfm-param-squad',
		'services/auth',
		'helpers/knockout-lazy'],
	function (ko,
		appHelper,
		UserProfile,
		SectionPattern,
		sectionPatternService,
		WfmParamSquad,
		wfmParamSquadService,
		userProfileService) {
	'use strict';

	/**
	 * Root view model
	 * @constructor
	 */
	var exports = function () {
		/**
		 * Param squads
		 */
		this.wfmParamSquadList = ko.lazyObservableArray(this.loadParamSquadList, this);

		/**
		 * A list of section patterns: lazy loading by first request
		 */
		this.ListOfSectionPatternDto = ko.lazyObservableArray(this.loadListOfSectionPattern, this);

		/**
		 * All parameters from all groups as one dimensional array
		 */
		this.wfmParameterList = ko.computed({
				read : this.calcWfmParameterList,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * User profile model
		 * @type {module:models/user-profile}
		 */
		this.userProfile = ko.observable();

		/**
		 * Whether profile is loaded: profile can be loaded, but not exists (if user is not logged or registered)
		 *    Existing of profile need to check, using ths.userProfile object
		 * @type {boolean}
		 */
		this.isTriedToLoadUserProfile = ko.observable(false);
	};

	exports.prototype.setUserProfile = function (r) {
		this.userProfile(new UserProfile(r, this));
	};

	exports.prototype.cleanUserProfile = function () {
		this.userProfile(null);
		// automatically cleaned all child companies, wegions etc.
	};

	/**
	 * Try to get user profile: Email, Roles, IsLogged
	 */
	exports.prototype.tryToLoadUserProfile = function () {
		// Send auth cookies to the server
		userProfileService.getUserProfile()
		.done(this.setUserProfile.bind(this))
		.always(this.setTryStatus.bind(this));
	};

	exports.prototype.setTryStatus = function () {
		this.isTriedToLoadUserProfile(true);
	};

	/**
	 * End the session
	 *    Logoff only from current cabinet (now, logic may changed)
	 */
	exports.prototype.accountLogOff = function () {
    // sync methods, no time to wait response
		userProfileService.accountLogOff();
    this.cleanUserProfile();
	};

	/**
	 * Calculate parameters from squads
	 * @private
	 * @returns {module:models/wfm-parameter}
	 */
	exports.prototype.calcWfmParameterList = function () {
		var outArr = [];

		ko.unwrap(this.wfmParamSquadList).forEach(function (sqdElem) {
			ko.unwrap(sqdElem.wfmParameterList).forEach(function (prmElem) {
				outArr.push(prmElem);
			});
		});

		return outArr;
	};

	/** Load squads */
	exports.prototype.loadParamSquadList = function () {
		wfmParamSquadService.getInclusive().done(this.applyParamSquadList.bind(this));
	};

	/**
	 * Apply squads after loading
	 * @private
	 */
	exports.prototype.applyParamSquadList = function (data) {
		data = data || [];
		this.wfmParamSquadList(data.map(function (item) {
				return new WfmParamSquad(item);
			}));
	};

	/**
	 * Load a list of patterns
	 * @private
	 */
	exports.prototype.loadListOfSectionPattern = function () {
		sectionPatternService.get().done(this.applyListOfSectionPattern.bind(this));
	};

	/**
	 * Apply patterns
	 * @private
	 */
	exports.prototype.applyListOfSectionPattern = function (data) {
		data = data || [];
		this.ListOfSectionPatternDto(data.map(function (item) {
				return new SectionPattern(item);
			}));
	};

	return exports;
});
