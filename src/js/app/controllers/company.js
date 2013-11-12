﻿// Controllers (directives) for company page
// requirejs: app/controllers
// angular: ang-cabinet-controllers

define(['jquery',
    'angular',
    'app/datacontext',
    'angular-route',
    'app/services',
    'app/app-filters',
    'jquery.ui.widget', 'jquery.iframe-transport',
    // The XDomainRequest Transport is included for cross-domain file deletion for IE8+ 
    'ajaxupload/cors/jquery.xdr-transport',
    'ajaxupload/cors/jquery.postmessage-transport',
    'jquery.lightbox', 'bootstrap-datepicker'],
    function ($, angular, appDatacontext) {
        'use strict';

        angular.module('ang-company-controllers', ['ngRoute', 'ang-cabinet-services', 'ang-app-filters'])
        .controller('CompanyUserCtrl', ['$scope', 'SharedService', function (scp, sharedService) {
            scp.accessLevelDict = sharedService.getSharedObject().accessLevelDict;

            scp.isLoadedCompanyUserList = false;

            scp.companyUserList = [];

            // Get company list
            appDatacontext.getCompanyUserList().done(function (response) {
                scp.$apply(function () {
                    scp.companyUserList = response;
                    scp.isLoadedCompanyUserList = true;
                });
            });

            scp.isOwnerAlready = function () {
                // when user is company owner already then block link "register company"
                // if AccessLevel == 0 then block link
                var result = false;

                $.each(scp.companyUserList, function (companyUserIndex, companyUserValue) {
                    if ((parseInt(companyUserValue.AccessLevel, 10) & sharedService.getOwnerAccessCode()) > 0) {
                        // find need value and break this cycle
                        result = true;
                        return false;
                    }
                    else {
                        // continue cycle
                        return true;
                    }
                });

                return result;
            };
        }])
        .controller('CompanyCreateCtrl', ['$scope', '$location', function (scp, angLocation) {
            scp.isPostSended = false;
            scp.postCompany = function () {
                scp.isPostSended = true;
                scp.companyNew.LogoUrl = '';
                appDatacontext.postCompany({}, scp.companyNew).done(function () {
                    angLocation.path('{{syst.companyListUrl}}');
                })
                .fail(function (jqXhr) {
                    if (jqXhr.status === 422) {
                        require(['app/lang-helper'], function (langHelper) {
                            // Because using jQuery ajax is out of the world of angular, you need to wrap your $scope assignment inside of
                            scp.$apply(function () {
                                scp.processError = (langHelper.translate(jqXhr.responseJSON.errId) || '{{lang.unknownError}}');
                            });
                        });
                    }
                })
                .always(function () {
                    scp.$apply(function () {
                        // Activate button for sending request one more time (like 'try later' or need to change some fields)
                        scp.isPostSended = false;
                    });
                });
            };
        }])
        .controller('CompanyManageInfoCtrl', ['$scope', '$routeParams', function (angScope, angRouteParams) {
            var companyId = angRouteParams.companyId;
            // Check company id as Guid
            if (!companyId || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(companyId) === false) {
                return;
            }

            // TODO: Make url query for CORS
            // TODO: Get url query from datacontext function
            angScope.setFileUpload = function () {
                require(['app/file-helper'], function (fileHelper) {
                    var fileUploadInput = document.getElementById('company-logo-file-upload');
                    fileHelper.initFileUpload(fileUploadInput, '{{conf.requrl}}/api/company?id=' + companyId, ['image/png', 'image/jpeg', 'image/gif'], function (respImg) {
                        angScope.$apply(function () {
                            // apply logo from response: plus unique hash for update img in html
                            angScope.company.LogoUrl = respImg.LogoUrl + "?" + new Date().getTime();
                        });
                    });
                });
            };

            // load company info
            angScope.isLoadedCompany = false;

            appDatacontext.getCompany({ id: companyId }).done(function (response) {
                angScope.$apply(function () {
                    angScope.companyOriginal = response;
                    angScope.company = angular.copy(angScope.companyOriginal);
                    angScope.isLoadedCompany = true;
                });
            });

            angScope.isClean = function () {
                return angular.equals(angScope.companyOriginal, angScope.company);
            };

            angScope.putCompany = function () {
                appDatacontext.putCompany({ id: companyId }, angScope.company).done(function (response) {
                    angScope.$apply(function () {
                        angScope.companyOriginal = response;
                    });
                });
            };
        }])
        .controller('CompanyManageUserCtrl', ['$scope', '$routeParams', 'SharedService', function (angScope, angRouteParams, sharedService) {
            var companyId = angRouteParams.companyId;

            if (!companyId || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(companyId) === false) { return; }

            angScope.companyUserList = [];
            angScope.isLoadedCompanyUserList = false;

            // Load company users
            appDatacontext.getCompanyUserList({ company_id: companyId }).done(function (response) {
                angScope.$apply(function () {
                    angScope.companyUserList = response;
                    angScope.isLoadedCompanyUserList = true;
                });
            });

            angScope.accessLevelDict = sharedService.getSharedObject().accessLevelDict;

            angScope.companyUserNew = {
                CompanyId: companyId,
                AccessLevel: 0,
                UserProfileDto: {
                    Email: ''
                }
            };

            ////angScope.postCompanyUser = function () {
            // TODO: change to appDatacontext
            ////    companyUserFactory.post(angScope.companyUserNew, function (createdCompanyUser) {
            ////        angScope.companyUserList.push(createdCompanyUser);
            ////        angScope.companyUserNew.UserProfileDto.Email = '';
            ////    }, function (errorResult) {
            ////        if (errorResult.data && errorResult.data.Message) {
            ////            alert('Error: ' + errorResult.data.Message);
            ////        }
            ////    });
            ////};
        }])
        .controller('WorkspaceCtrl', ['$scope', '$routeParams', function (angScope, angRouteParams) {
            // View workspace: do not load libs for edit (for example Wisywig editor, or file-uploading features)
            // Views can be devided too: one - for view, second - for edit (do not put external elements, like input boxes, file-input boxes etc.)
            require(['compability-fix'], function () {
                // {{#if conf.isProd}}
                ////require(['app/workspace/project-bundle-{{package.version}}.min']);
                // {{else}}
                ////require(['app/workspace/project']);
                // {{/if}}

                require(['jquery',
                    'knockout',
                    'app/models/workspace',
                    'app/bindings',
                    'ko-external-template-engine'], function ($, ko, WorkspaceViewModel) {

                        // This function is called once the DOM is ready.
                        // It will be safe to query the DOM and manipulate DOM nodes in this function.
                        $(function () {

                            // Get company Id
                            ////'9cf09ba5-c049-4148-8e5f-869c1e26c330';
                            var workspaceViewModel = new WorkspaceViewModel(angRouteParams.companyId, angRouteParams['editable'] ? true : false, {
                                regionId: parseInt(angRouteParams['region']),
                                fieldId: parseInt(angRouteParams['field']),
                                groupId: parseInt(angRouteParams['group']),
                                wellId: parseInt(angRouteParams['well']),
                                sectionId: parseInt(angRouteParams['section'])
                            });
                            ko.applyBindings(workspaceViewModel, document.getElementById('workspace-project'));
                            var jqrWindow = $(window);
                            jqrWindow.resize(function () {
                                workspaceViewModel.windowHeight(jqrWindow.height());
                                workspaceViewModel.windowWidth(jqrWindow.width());
                            });
                        });
                    });
            });
        }]);
    });