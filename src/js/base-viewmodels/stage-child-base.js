/** @module */
define(['knockout',
		'helpers/history-helper'],
	function (ko,
		historyHelper) {
	'use strict';

	/**
	 * Base view for manage childs of main stages: userProfile, company, wegion, wield, wroup (well has no childrens)
	 *    If stage has children
	 * @constructor
	 */
	var exports = function (defaultUnqOfSlcVwmChild) {
		// First need to point: listOfVwmChild (children's viewmodels)
		var ths = this;

		/** Unique key of viewmodel of selected child */
		this.unqOfSlcVwmChild = ko.observable(defaultUnqOfSlcVwmChild);

		// Remove default value to not reuse again
		defaultUnqOfSlcVwmChild = null;

		/** Child viewmodel - current selected employee */
		this.slcVwmChild = ko.computed({
				read : function () {
					var tmpUnq = ko.unwrap(ths.unqOfSlcVwmChild);
					if (tmpUnq) {
						return ko.unwrap(ths.listOfVwmChild).filter(function (elem) {
							return elem.unq === tmpUnq;
						})[0];
					}
				},
				deferEvaluation : true
			});

		/**
		 * Activate view of child stage: select all parents
		 *    1. Unselect all children
		 *    2. Select this
		 *    3. Select all parents (For userProfile - employee (company))
		 *    4. Set url fot this stage
		 */
		this.activateVwmChild = function (vwmChildToActivate) {
			// Unselect previous child: todo: why?
			////ths.unqOfSlcVwmChild(null);

			// Unselect
			var navigationArr = [];

			// For company - stage == employee
			if (vwmChildToActivate.vwmCompany) {
				vwmChildToActivate = vwmChildToActivate.vwmCompany;
			}

			// If a stage has children, then unselect all children
			if (typeof(vwmChildToActivate.unqOfSlcVwmChild) !== 'undefined') {
				vwmChildToActivate.unqOfSlcVwmChild(null);
			}

			// If not a selected section - show dashboard
			if (!ko.unwrap(vwmChildToActivate.unzOfSlcVwmSectionWrk)) {
				vwmChildToActivate.unselectVwmSectionWrk();
			}

			navigationArr = historyHelper.getNavigationArr(vwmChildToActivate.mdlStage);
			historyHelper.pushState('/' + navigationArr.join('/'));

			// Select current child
			ths.unqOfSlcVwmChild(vwmChildToActivate.unq);

			// Select all parents of this child
			if (ths.selectAncestorVwms) {
				ths.selectAncestorVwms();
			}

			// ths - parent (like company)
			// vwmChild - child (like wegion)
			// slcVwmChild - selected child (like wegion)
			// If parent - it is a child of other parent (company, employee -- it is a child of the userprofile)
			// UserProflie.slcVwmChild(thisEmployee of this company)
		};

		/** Unselect: show content of parent node, like WFM logo click: unselect choosed company and show company list */
		this.deactivateVwmChild = function () {
			ths.unqOfSlcVwmChild(null);

			var navigationArr = historyHelper.getNavigationArr(ths.mdlStage);

			historyHelper.pushState('/' + navigationArr.join('/'));
		};

		/** Open child after selection */
		this.slcVwmChild.subscribe(function (tmpSlcVwmChild) {
			if (tmpSlcVwmChild) {
				if (typeof(tmpSlcVwmChild.isOpenedItem) !== 'undefined') {
					tmpSlcVwmChild.isOpenedItem(true);
				}
			}
		});
	};

	return exports;
});
