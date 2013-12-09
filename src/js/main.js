require(['require-config'], function () {
    'use strict';

    require(['console-shim', 'es5-shim'], function () {
        require(['jquery', 'knockout', 'viewmodels/workspace', 'filters/bindings', 'jquery.panzoom'], function ($, ko, WorkspaceViewModel) {
            // Get company Id
            ////'9cf09ba5-c049-4148-8e5f-869c1e26c330';
            var workspaceViewModel = new WorkspaceViewModel();
            ////angRouteParams.companyId, {
            ////regionId: parseInt(angRouteParams['region']),
            ////fieldId: parseInt(angRouteParams['field']),
            ////groupId: parseInt(angRouteParams['group']),
            ////wellId: parseInt(angRouteParams['well']),
            ////sectionId: angRouteParams['section']
            ////});

            $(function () {
                // ======================================= pan zoom =======================
                var $panzoom = $('.panzoom').panzoom({
                    $zoomIn: $('.panzoom-in'),
                    $zoomOut: $('.panzoom-out'),
                    $reset: $('.panzoom-reset'),
                    increment: 0.3,
                    minScale: 0.0001,
                    maxScale: 10000,
                });

                $panzoom.parent().on('mousewheel.focal', function (e) {
                    e.preventDefault();
                    var delta = e.delta || e.originalEvent.wheelDelta;
                    var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
                    $panzoom.panzoom('zoom', zoomOut, {
                        increment: 0.1,
                        focal: e
                    });
                });
                // ======================================= pan zoom end =======================

                ko.applyBindings(workspaceViewModel, document.getElementById('workspace-project'));
            });
        });
    });
});