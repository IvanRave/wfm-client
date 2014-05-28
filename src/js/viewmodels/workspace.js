/** @module */
define(['knockout',
		'helpers/history-helper',
		'helpers/lang-helper',
		'helpers/cookie-helper',
		'constants/demo-auth-constants',
		'viewmodels/user-profile',
		'constants/global-css-constants'],
	function (ko,
		historyHelper,
		langHelper,
		cookieHelper,
		demoAuthConstants,
		VwmUserProfile,
		globalCssCnst) {
	'use strict';

	/**
	 * A workspace view model: a root for knockout
	 * @constructor
	 */
	var exports = function (mdlWorkspace) {
		/** Data model for this view */
		this.mdlWorkspace = mdlWorkspace;

		/**
		 * Whether left tree menu with well regions, groups, fields, wells is visible
		 * @type {boolean}
		 */
		this.isVisibleMenu = ko.observable(true);

		/**
		 * List of global csses
		 *    from constants
		 * @type {Array.<Object>}
		 */
		this.listOfGlobalCss = globalCssCnst;

		/**
		 * Current global css
		 * @type {string}
		 */
		this.curGlobalCss = ko.observable(null);

		this.curGlobalCss.subscribe(this.changeGlobalCss, this);

		// /**
		// * Global css for the site
		// * @type {string}
		// */
		// this.wfmGlobalCss = ko.computed({
		// read : this.calcWfmGlobalCss,
		// deferEvaluation : true,
		// owner : this
		// });

		this.sidebarWrapCss = ko.computed({
				read : this.calcSidebarWrapCss,
				deferEvaluation : true,
				owner : this
			});

		this.workAreaCss = ko.computed({
				read : this.calcWorkAreaCss,
				deferEvaluation : true,
				owner : this
			});

		this.sidebarToggleCss = ko.computed({
				read : this.calcSidebarToggleCss,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Whether current employee in edit mode: fast access for view
		 * @type {boolean}
		 */
		this.isEmployeeInEditMode = ko.computed({
				read : this.calcIsEmployeeInEditMode,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Data from url to select need stages and sections: initialUrlData
		 * @private
		 */
		this.defaultSlcData_ = historyHelper.getInitialData(document.location.hash.substring(1));

		/**
		 * User profile view model
		 * @type {module:viewmodels/user-profile}
		 */
		this.vwmUserProfile = ko.computed({
				read : this.buildVwmUserProfile,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Whether user is registered: define page: logon or register
		 * @type {boolean}
		 */
		this.isRegisteredPage = ko.observable(true);

		/**
		 * Whether the user in the demo mode
		 * @type {boolean}
		 */
		this.isUserInDemoMode = ko.computed({
				read : this.calcIsUserInDemoMode,
				deferEvaluation : true,
				owner : this
			});

		this.objToRealLogOn = {
			email : ko.observable(''),
			/**
			 * User pwd: need for logon or register or change password features
			 * @type {string}
			 */
			password : ko.observable(''),
			/**
			 * Whether browser is remember this user
			 * @type {boolean}
			 */
			rememberMe : ko.observable(false)
		};

		this.errToRealLogOn = ko.observable('');

		this.objToRegister = {
			email : ko.observable(''),
			/**
			 * User password: need for logon or register or change password features
			 * @type {string}
			 */
			password : ko.observable(''),
			/**
			 * User password confirmation: need for register purpose
			 * @type {string}
			 */
			passwordConfirmation : ko.observable('')
		};

		/** Messages for registration: error and success */
		this.msgToRegister = {
			err : ko.observable(''),
			scs : ko.observable('')
		};

		this.msgToConfirmRegistration = {
			err : ko.observable(''),
			scs : ko.observable('')
		};

		this.objToConfirmRegistration = {
			email : ko.observable(''),
			/**
			 * Random token to confirm registration: sended to registered user through email
			 * @type {string}
			 */
			token : ko.observable('')
		};

		/** After initialization: try to load user */
		this.mdlWorkspace.tryToLoadUserProfile();

		/** Back, forward, re   fresh browser navigation */
		// TODO: back
		////window.onpopstate = function () {
		////    var stateData = historyHelper.getInitialData(document.location.hash.substring(1));
		////    // When load any info - do not push info to history again
		////    stateData.isHistory = true;
		////    // Reload all data
		////    ths.initialUrlData(stateData);

		////    console.log('location: ' + document.location.hash + ', state: ' + JSON.stringify(stateData));

		////    ths.userProfile.loadUserProfile();
		////};
	};

	/** Log off from a viewmodel */
	exports.prototype.logOff = function () {
		this.mdlWorkspace.logOff();
	};

	/** Build a viewmodel for user profile */
	exports.prototype.buildVwmUserProfile = function () {
		var tmpMdlUserProfile = ko.unwrap(this.mdlWorkspace.userProfile);
		if (tmpMdlUserProfile) {
			return new VwmUserProfile(tmpMdlUserProfile, this.defaultSlcData_);
		}
	};

	// Left tree menu with well regions, groups, fields, wells
	exports.prototype.toggleIsVisibleMenu = function () {
		this.isVisibleMenu(!ko.unwrap(this.isVisibleMenu));
	};

	/**
	 * Calculate, whether the employee in an edit mode
	 * @returns {boolean}
	 */
	exports.prototype.calcIsEmployeeInEditMode = function () {
		var tmpVwmUserProfile = ko.unwrap(this.vwmUserProfile);
		if (tmpVwmUserProfile) {
			var tmpEmployee = ko.unwrap(tmpVwmUserProfile.slcVwmChild);
			if (tmpEmployee) {
				return ko.unwrap(tmpEmployee.isEditMode);
			}
		}
	};

	/**
	 * Calculate css for sidebar
	 * @returns {string}
	 */
	exports.prototype.calcSidebarToggleCss = function () {
		return ko.unwrap(this.isVisibleMenu) ? 'sidebar-toggle-visible' : 'sidebar-toggle-hidden';
	};

	/**
	 * Calculate css for a work area
	 * @returns {string}
	 */
	exports.prototype.calcWorkAreaCss = function () {
		return ko.unwrap(this.isVisibleMenu) ? 'work-area' : '';
	};

	/**
	 * Calculate css for a sidebar wrap
	 * @returns {string}
	 */
	exports.prototype.calcSidebarWrapCss = function () {
		return ko.unwrap(this.isVisibleMenu) ? 'sidebar-wrap-visible' : 'hidden';
	};

	/** Toggle registered state: login or register page */
	exports.prototype.toggleIsRegisteredPage = function () {
		this.isRegisteredPage(!ko.unwrap(this.isRegisteredPage));
	};

	/**
	 * Calculate, whether the user in a demo mode
	 * @returns {boolean}
	 */
	exports.prototype.calcIsUserInDemoMode = function () {
		var tmpUserProfile = ko.unwrap(this.mdlWorkspace.userProfile);

		if (!tmpUserProfile) {
			return false;
		}

		return (ko.unwrap(tmpUserProfile.email) === demoAuthConstants.email);
	};

	/** Confirm registration */
	exports.prototype.confirmRegistration = function () {
		this.msgToConfirmRegistration.err('');
		this.msgToConfirmRegistration.scs('');

		// TODO: check obj, using format
		this.mdlWorkspace.sendConfirmRegistration(ko.toJS(this.objToConfirmRegistration),
			this.confirmRegistrationSuccess.bind(this),
			this.confirmRegistrationError.bind(this));
	};

	exports.prototype.confirmRegistrationSuccess = function () {
		this.msgToConfirmRegistration.scs('{{capitalizeFirst lang.confirmRegistrationSuccessful}}');
	};

	exports.prototype.confirmRegistrationError = function (jqXhr) {
		if (jqXhr.status === 422) {
			this.msgToConfirmRegistration.err(langHelper.translate(jqXhr.responseJSON.errId) || '{{lang.unknownError}}');
		}
	};

	exports.prototype.register = function () {
		// Clean msges
		this.msgToRegister.err('');
		this.msgToRegister.scs('');

		this.mdlWorkspace.sendRegister(ko.toJS(this.objToRegister),
			this.handleRegisterSuccess.bind(this),
			this.handleRegisterError.bind(this));
	};

	exports.prototype.handleRegisterSuccess = function () {
		this.msgToRegister.scs('{{capitalizeFirst lang.checkToConfirmationToken}}');
	};

	exports.prototype.handleRegisterError = function (jqXHR) {
		if (jqXHR.status === 422) {
			this.msgToRegister.err(langHelper.translate(jqXHR.responseJSON.errId) || '{{lang.unknownError}}');
		}
	};

	/** Demo logon */
	exports.prototype.demoLogOn = function () {
		this.mdlWorkspace.sendLogOn(demoAuthConstants,
			this.handleLogOnSuccess.bind(this),
			this.handleLogOnError.bind(this));
	};

	exports.prototype.realLogOn = function () {
		this.errToRealLogOn('');
		// get obj from fields check obj
		// Convert to object without observables
		this.mdlWorkspace.sendLogOn(ko.toJS(this.objToRealLogOn),
			this.handleLogOnSuccess.bind(this),
			this.handleLogOnError.bind(this));
	};

	exports.prototype.handleLogOnSuccess = function (userProfileData) {
		this.mdlWorkspace.setUserProfile(userProfileData);
		// Clear added object: if user logoff then need empty fields to logon again (for different user)
		this.objToRealLogOn.email('');
		this.objToRealLogOn.password('');
		this.objToRealLogOn.rememberMe(false);
		this.errToRealLogOn('');
	};

	exports.prototype.handleLogOnError = function (jqXhr) {
		if (jqXhr.status === 422) {
			this.errToRealLogOn(langHelper.translate(jqXhr.responseJSON.errId) || '{{lang.unknownError}}');
		}
	};

	/**
	 * Change href of the link in the head of the site
	 *    change cookie
	 */
	exports.prototype.changeGlobalCss = function (choosedCss) {
		if (!choosedCss) {
			return;
		}

		var styleLinkElem = document.getElementById('wfm-style-link');
		styleLinkElem.href = choosedCss.path + '?{{package.version}}';

		cookieHelper.createCookie('{{ syst.wfmStyleLinkCookie }}', choosedCss.path, 30);
	};

	return exports;
});
