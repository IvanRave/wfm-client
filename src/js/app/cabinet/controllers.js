// Controllers (directives) for company page
// requirejs: app/cabinet/controllers
// angular: ang-cabinet-controllers

define(['jquery',
    'angular',
    'app/datacontext',
    'app/cookie-helper',
    'angular-route',
    'app/app-resource',
    'app/cabinet/services',
    'app/app-filters',
    'jquery.ui.widget', 'jquery.iframe-transport',
    // The XDomainRequest Transport is included for cross-domain file deletion for IE8+ 
    'ajaxupload/cors/jquery.xdr-transport',
    'ajaxupload/cors/jquery.postmessage-transport',
    'jquery.lightbox', 'bootstrap-datepicker'],
    function ($, angular, appDatacontext, cookieHelper) {
        'use strict';

        return angular.module('ang-cabinet-controllers', ['ngRoute', 'ang-app-resource', 'ang-cabinet-services', 'ang-app-filters'])
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
                    angLocation.path('/all');
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
            // Check company id as Guid
            if (!angRouteParams.id || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(angRouteParams.id) === false) { return; }

            // TODO: Make url query for CORS
            // TODO: Get url query from datacontext function
            angScope.setFileUpload = function () {
                require(['app/file-helper'], function (fileHelper) {
                    var fileUploadInput = document.getElementById('company-logo-file-upload');
                    fileHelper.initFileUpload(fileUploadInput, '{{conf.requrl}}/api/company?id=' + angRouteParams.id, ['image/png', 'image/jpeg', 'image/gif'], function (respImg) {
                        angScope.$apply(function () {
                            // apply logo from response: plus unique hash for update img in html
                            angScope.company.LogoUrl = respImg.LogoUrl + "?" + new Date().getTime();
                        });
                    });
                });
            };

            // load company info
            angScope.isLoadedCompany = false;

            appDatacontext.getCompany({ id: angRouteParams.id }).done(function (response) {
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
                appDatacontext.putCompany({ id: angRouteParams.id }, angScope.company).done(function (response) {
                    angScope.$apply(function () {
                        angScope.companyOriginal = response;
                    });
                });
            };
        }])
        .controller('CompanyManageUserCtrl', ['$scope', '$routeParams', 'SharedService', function (angScope, angRouteParams, sharedService) {
            if (!angRouteParams.id || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(angRouteParams.id) === false) { return; }

            angScope.companyUserList = [];
            angScope.isLoadedCompanyUserList = false;

            // Load company users
            appDatacontext.getCompanyUserList({ company_id: angRouteParams.id }).done(function (response) {
                angScope.$apply(function () {
                    angScope.companyUserList = response;
                    angScope.isLoadedCompanyUserList = true;
                });
            });

            angScope.accessLevelDict = sharedService.getSharedObject().accessLevelDict;

            angScope.companyUserNew = {
                CompanyId: angRouteParams.id,
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
        .controller('AccountLogonCtrl', ['$scope', '$rootScope', '$location', '$routeParams', function (scp, angRootScope, angLocation, angRouteParams) {
            angRootScope.isLogged = false;

            scp.usver = {
                Email: angRouteParams.email
            };

            // When user successfuly confirm email after registration - need to show notification
            scp.isEmailConfirmed = angRouteParams.confirmed;

            scp.isProcessBtnEnabled = true;

            scp.processError = '';

            // Password restriction bounds
            scp.bound = {
                password: {
                    minLength: 6,
                    maxLength: 18
                }
            };

            function afterLogon() {
                ////angWindow.alert('success logon');
                // Navigate to company list from /account/logon/index.html
                //angWindow.location.href = '../../company/{{conf.defPage}}';
                cookieHelper.createCookie('{{syst.cookieIsAuth}}', 'true');
                scp.$apply(function () {
                    angRootScope.isLogged = true;
                    angLocation.path('/all');
                });
            }

            scp.tryAuth = function () {
                scp.isProcessBtnEnabled = false;
                appDatacontext.accountLogon({}, scp.usver).done(afterLogon).fail(function (jqXHR) {
                    if (jqXHR.status === 422) {
                        var resJson = jqXHR.responseJSON;
                        var tmpProcessError = '*';
                        require(['app/lang-helper'], function (langHelper) {
                            tmpProcessError += (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
                            // Because using jQuery ajax is out of the world of angular, you need to wrap your $scope assignment inside of
                            scp.$apply(function () {
                                scp.processError = tmpProcessError;
                            });
                        });
                    }
                }).always(function () {
                    // When error or smth activate login button
                    scp.$apply(function () {
                        scp.isProcessBtnEnabled = true;
                    });
                });
            };

            scp.isTestLoginBtnEnabled = true;

            scp.testAuth = function () {
                scp.isTestLoginBtnEnabled = false;
                appDatacontext.accountLogon({}, {
                    "Email": "wfm@example.com",
                    "Password": "123321"
                }).done(afterLogon);
            };
        }])
        .controller('AccountLogoffCtrl', ['$window', function (angWindow) {
            // Remove AUTH httponly cookie and is_auth cookie
            appDatacontext.accountLogoff().done(function () {
                cookieHelper.removeCookie('{{syst.cookieIsAuth}}');
                // After logoff navigate to the main page
                angWindow.location.href = '#/{{syst.logonUrl}}';
            });
        }])
        .controller('AccountRegisterCtrl', ['$scope', '$location', function (scp, angLocation) {
            scp.isProcessBtnEnabled = true;

            scp.processError = '';

            // Password restriction bounds
            scp.bound = {
                password: {
                    minLength: 6,
                    maxLength: 18
                }
            };

            scp.tryRegister = function () {
                scp.isProcessBtnEnabled = false;

                appDatacontext.accountRegister({}, scp.usver).done(function () {
                    angLocation.path('/{{syst.registerConfirmationUrl}}').search({
                        email: scp.usver.Email
                    });
                    ////angWindow.alert('Success. Please check your email to confirm registration.');
                    // TODO:
                    // Send to email-confirm-sending
                    // Redirect to email-confirmation with email in url
                    // page with one text box (or with email) to put token into 
                    // and confirm button
                }).fail(function (jqXhr) {
                    if (jqXhr.status === 422) {
                        require(['app/lang-helper'], function (langHelper) {
                            // Because using jQuery ajax is out of the world of angular, you need to wrap your $scope assignment inside of
                            scp.$apply(function () {
                                scp.processError = (langHelper.translate(jqXhr.responseJSON.errId) || '{{lang.unknownError}}');
                                scp.isProcessBtnEnabled = true;
                            });
                        });
                    }
                });
            };
        }])
        .controller('AccountRegisterConfirmationCtrl', ['$scope', '$routeParams', '$location', function (angScope, angRouteParams, angLocation) {

            angScope.usver = {
                email: angRouteParams.email,
                token: angRouteParams.token
            };

            angScope.isProcessBtnEnabled = true;
            angScope.processError = '';
            angScope.confirmEmail = function () {
                angScope.isProcessBtnEnabled = false;
                appDatacontext.accountRegisterConfirmation({}, angScope.usver).done(function () {
                    angScope.$apply(function () {
                        angLocation.path('/{{syst.logonUrl}}').search({ email: angScope.usver.email, confirmed: true });
                    });
                }).fail(function () {
                    angScope.$apply(function () {
                        angScope.isProcessBtnEnabled = true;
                        angScope.processError = '{{lang.emailConfirmationIsUnsuccessful}}';
                    });
                });
            };

            ////var confirmationEmail = angRouteParams.email,// decodeURIComponent(appHelper.queryString['email']),
            ////    confirmationToken = angRouteParams.token; // appHelper.queryString['token'];            
        }])
        .controller('WorkspaceCtrl', ['$routeParams', function (angRouteParams) {
            require(['compability-fix'], function () {
                // {{#if conf.isProd}}
                ////require(['app/workspace/project-bundle-{{package.version}}.min']);
                // {{else}}
                ////require(['app/workspace/project']);
                // {{/if}}

                require(['jquery',
                    'knockout',
                    'app/workspace/viewmodel',
                    'app/bindings',
                    'ko-external-template-engine'], function ($, ko, AppViewModel) {

                        // This function is called once the DOM is ready.
                        // It will be safe to query the DOM and manipulate DOM nodes in this function.
                        $(function () {
                            // Get company Id
                            ////var companyId = appHelper.queryString['cid'];
                            ////'9cf09ba5-c049-4148-8e5f-869c1e26c330';
                            var wfmAppViewModel = new AppViewModel(angRouteParams.cid, angRouteParams.editable ? true : false);
                            ko.applyBindings(wfmAppViewModel, document.getElementById('workspace-project'));
                            var jqrWindow = $(window);
                            jqrWindow.resize(function () {
                                wfmAppViewModel.windowHeight(jqrWindow.height());
                                wfmAppViewModel.windowWidth(jqrWindow.width());
                            });
                        });
                    });
            });
        }]);
    });