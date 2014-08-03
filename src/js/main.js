require(['require-config'], function () {
	'use strict';

	require(['console-shim', 'es5-shim', 'es5-sham'], function () {
		require(['jquery', 'knockout', 'viewmodels/workspace', 'models/workspace', 'bindings/all-bindings', 'bindings/svg-bindings', 'jquery.panzoom'], function ($, ko, VwmWorkspace, MdlWorkspace) {

			// Can be added HasItems checker for all observable and computed arrays
			// Usefull instead checking "arr().length > 0" in views
			var funcTrackHasItem = function () {
				this.hasItems = ko.computed({
						read : function () {
							return ko.unwrap(this).length > 0;
						},
						deferEvaluation : true,
						owner : this
					});

				// Support chaining by returning the array
				return this;
			};

			// Only for arrays (with length property)
			ko.computed.fn.trackHasItems = funcTrackHasItem;
			ko.observableArray.fn.trackHasItems = funcTrackHasItem;

			var mdlWorkspace = new MdlWorkspace();
			var vwmWorkspace = new VwmWorkspace(mdlWorkspace);

			$(function () {
				// ======================================= pan zoom =======================
				var $panzoom = $('.panzoom').panzoom({
						$zoomIn : $('.panzoom-in'),
						$zoomOut : $('.panzoom-out'),
						$reset : $('.panzoom-reset'),
						increment : 0.3,
						minScale : 0.0001,
						maxScale : 10000,
					});

				$panzoom.parent().on('mousewheel.focal', function (e) {
					e.preventDefault();
					var delta = e.delta || e.originalEvent.wheelDelta;
					var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
					$panzoom.panzoom('zoom', zoomOut, {
						increment : 0.1,
						focal : e
					});
				});
				// ======================================= pan zoom end =======================

				var workspaceProjectBlock = document.getElementById('workspace-project');

				ko.applyBindings(vwmWorkspace, workspaceProjectBlock);
				$(workspaceProjectBlock).removeClass('hide');
			});
		});
	});
});
