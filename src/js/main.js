require(['require-config'], function () {
    'use strict';

    require(['jquery', 'angular', 'app/controllers/company', 'app/controllers/auth', 'app/controllers/register', 'angular-route', 'jquery.bootstrap'], function ($, angular) {
        var PRJ_MODULE_NAME = 'ang-cabinet-project';

        angular.module(PRJ_MODULE_NAME, ['ngRoute', 'ang-company-controllers', 'ang-auth-controllers', 'ang-register-controllers'])
        .config(['$routeProvider', '$httpProvider', '$interpolateProvider', function (rpr, angHttpProvider, angInterpolateProvider) {
            rpr.when('{{syst.logonUrl}}', { controller: 'AccountLogonCtrl', templateUrl: '.{{syst.tplUrl}}{{syst.logonUrl}}{{syst.tplExt}}' })
                .when('{{syst.logoffUrl}}', { controller: 'AccountLogoffCtrl', templateUrl: '.{{syst.tplUrl}}{{syst.logoffUrl}}{{syst.tplExt}}' })
                .when('{{syst.registerUrl}}', { controller: 'AccountRegisterCtrl', templateUrl: '.{{syst.tplUrl}}{{syst.registerUrl}}{{syst.tplExt}}' })
                .when('{{syst.registerConfirmationUrl}}', { controller: 'AccountRegisterConfirmationCtrl', templateUrl: '.{{syst.tplUrl}}{{syst.registerConfirmationUrl}}{{syst.tplExt}}' })
                .when('{{syst.companyListUrl}}', { controller: 'CompanyUserCtrl', templateUrl: '.{{syst.tplUrl}}/cabinet/company-list.html' })
                .when('{{syst.companyListUrl}}/create', { controller: 'CompanyCreateCtrl', templateUrl: '.{{syst.tplUrl}}/cabinet/company-create.html' })
                .when('{{syst.companyListUrl}}/:companyId/manage-info', { controller: 'CompanyManageInfoCtrl', templateUrl: '.{{syst.tplUrl}}/cabinet/manage-info.html' })
                .when('{{syst.companyListUrl}}/:companyId/manage-users', { controller: 'CompanyManageUserCtrl', templateUrl: '.{{syst.tplUrl}}/cabinet/manage-user.html' })
                .when('{{syst.companyListUrl}}/:companyId/view', { controller: 'WorkspaceCtrl', templateUrl: '.{{syst.tplUrl}}/workspace.html', reloadOnSearch: false })
                .when('{{syst.companyListUrl}}/:companyId/manage', { controller: 'WorkspaceCtrl', templateUrl: '.{{syst.tplUrl}}/workspace.html', reloadOnSearch: false })
                .otherwise({ redirectTo: '{{syst.companyListUrl}}' });

            // Turn in CORS cookie support
            angHttpProvider.defaults.withCredentials = true;

            // Change standard curly braces tempate engine to {[{value}]}
            angInterpolateProvider.startSymbol('{[{').endSymbol('}]}');
        }])
        .run(['$rootScope', function (angRootScope) {
            angRootScope.isLogged = true;
        }]);

        // Configuration blocks - get executed during the provider registrations and configuration phase. 
        // Only providers and constants can be injected into configuration blocks. 
        // This is to prevent accidental instantiation of services before they have been fully configured.

        // Run blocks - get executed after the injector is created and are used to kickstart the application. 
        // Only instances and constants can be injected into run blocks. 
        // This is to prevent further system configuration during application run time.

        // Using jQuery dom ready because it will run this even if DOM load already happened
        $(function () {
            var wfmProject = document.getElementById('wfm-project');
            angular.bootstrap(wfmProject, [PRJ_MODULE_NAME]);
            $(wfmProject).removeClass('hide');
        });
    });
});