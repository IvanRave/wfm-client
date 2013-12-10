require(['require-config'], function () {
    'use strict';

    require(['console-shim', 'es5-shim'], function () {
        require(['jquery', 'knockout', 'viewmodels/workspace', 'filters/bindings', 'jquery.panzoom'], function ($, ko, WorkspaceViewModel) {
            var workspaceViewModel = new WorkspaceViewModel();

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