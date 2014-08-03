define(function (require, exports, module) {
/** @module viewmodels/workspace */
'use strict';

var ko = require('knockout');
var historyHelper = require('helpers/history-helper');
var cookieHelper = require('helpers/cookie-helper');
var VwmUserProfile = require('viewmodels/user-profile');
var globalCssCnst = require('constants/global-css-constants');
var langHelper = require('helpers/lang-helper');
var sessionService = require('services/session');
var authService = require('services/auth');
var globalVars = require('helpers/global-vars');

// http://stackoverflow.com/questions/8648892/convert-url-parameters-to-a-javascript-object
function calcObjFromUrl(search) {
	return search ? JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
		function (key, value) {
		return key === "" ? value : decodeURIComponent(value);
	}) : {};
}

function handleAuthResult(scsNext, failNext, authResult) {
	var resultObj = calcObjFromUrl(authResult);
	console.log(resultObj);
	// Send a code to the api (change to sid)

	sessionService.buildSession(resultObj.code).done(scsNext).fail(failNext);
}

/**
 * A workspace view model: a root for knockout
 * @constructor
 */
exports = function (mdlWorkspace) {
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
	 * Changes when you click to Login button
	 *    Back to false, when login proccess is ended
	 * @type {Boolean}
	 */
	this.isLoginInProgress = ko.observable(false);

	/**
	 * After initialization: try to load user
	 * @todo #43! try to move to init commands, instead this model
	 */
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

/**
 * Handle success session
 * @param {Object} sessionOfUser - { accessToken , expiredIn, uname }
 */
exports.prototype.handleSuccessSession = function (sessionOfUser) {
	//cookieHelper.createCookie('access_token', sessionOfUser.accessToken, sessionOfUser.expiredIn);

  ////this.mdlWorkspace.sessionOfUser(sessionOfUser);
  
  globalVars.sessionOfUser = sessionOfUser;
  
	this.mdlWorkspace.setUserProfile({
		uname : sessionOfUser.uname
	});

	this.isLoginInProgress(false);
};

/**
 * Handle failed session
 */
exports.prototype.handleFailedSession = function (jqXhr) {
	if (jqXhr.status === 422) {
		alert(langHelper.translate(jqXhr.responseJSON.message) || 'unknown error');
		return;
	} else {
		alert('Error: status: ' + jqXhr.status + '; message: ' + jqXhr.responseText);
		return;
	}

	console.log('error from wfm-node', jqXhr);
};

/** Open the auth window, start authentication */
exports.prototype.openAuth = function () {
	this.isLoginInProgress(true);

	authService.accountLogOn(handleAuthResult.bind(null,
			this.handleSuccessSession.bind(this),
			this.handleFailedSession.bind(this)));
};

/**
 * End the session
 *    Logoff only from current cabinet (now, logic may changed)
 */
exports.prototype.accountLogOff = function () {
	this.mdlWorkspace.accountLogOff();
};

/**
 * End the session
 *    Logoff from current cabinet and PetrohelpAuth
 */
exports.prototype.accountFullLogOff = function () {
	this.mdlWorkspace.accountFullLogOff();
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

/**
 * Change href of the link in the head of the site
 *    change cookie
 */
exports.prototype.changeGlobalCss = function (choosedCss) {
	if (!choosedCss) {
		return;
	}

	var styleLinkElem = document.getElementById('wfm-style-link');
	styleLinkElem.href = choosedCss.path + '?0.9.9';

	cookieHelper.createCookie('wfmstylelink', choosedCss.path, 30);
};

module.exports = exports;

});