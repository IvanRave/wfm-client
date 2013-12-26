/** @module */
define(['helpers/app-helper'], function (appHelper) {
    'use strict';

    var historyHelper = {};

    var routes = [
            { url: '/companies' },
            { url: '/companies/{companyId:guid}' },
            { url: '/companies/{companyId:guid}/sections/{companySectionId}' },
            { url: '/companies/{companyId:guid}/well-regions/{wegionId:int}' },
            { url: '/companies/{companyId:guid}/well-regions/{wegionId:int}/sections/{wegionSectionId}' },
            { url: '/companies/{companyId:guid}/well-regions/{wegionId:int}/well-fields/{wieldId:int}' },
            { url: '/companies/{companyId:guid}/well-regions/{wegionId:int}/well-fields/{wieldId:int}/well-groups/{wroupId:int}' },
            { url: '/companies/{companyId:guid}/well-regions/{wegionId:int}/well-fields/{wieldId:int}/well-groups/{wroupId:int}/wells/{wellId:int}' },
            { url: '/account/logon' }, // may be with some query params, like redirectUrl
            { url: '/account/register' }
    ];

    /**
    * Returns initial data from hash: companyId, wellId, etc.
    * @param {string} str - Hash string: companies/123/well-regions/2334/well-fields
    * @returns {object} - Initial data
    */
    historyHelper.getInitialData = function (str) {
        var initialData = {};

        var currentUrlArr = str.split('/');
        // Remove empty parts
        currentUrlArr = currentUrlArr.filter(function (elem) {
            return elem.length > 0;
        });

        var needRoute;

        // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/every
        routes.every(function (route) {
            // Foreached route params
            var routeUrlArr = route.url.split('/');
            routeUrlArr = routeUrlArr.filter(function (elem) { return elem.length > 0; });

            // Match length of routes
            // If equals then check by parts
            // Else - next route
            if (routeUrlArr.length !== currentUrlArr.length) {
                // exit and continue with next route
                return true;
            }

            // Be default - are equals
            var isMatch = true;

            for (var i = 0; i < routeUrlArr.length; i += 1) {
                // If not a parameter then 
                // match current url part with route url part
                // If equals then next part (current route)
                // If not equal then break (match with next route)
                if (routeUrlArr[i][0] !== '{') {
                    if (routeUrlArr[i] !== currentUrlArr[i]) {
                        isMatch = false;
                    }
                }
            }

            if (isMatch) {
                needRoute = route;
                // Exit and break from cycle
                return false;
            }
            else {
                // Exit and continue cycle with next route (check next route)
                return true;
            }
        });

        // If route is not found
        if (!needRoute) {
            // No data - leave on the main page
            return initialData;
        }

        ////// Add current route with params
        ////initialData.route = needRoute;

        // Need route url arr of parts
        var needRouteUrlArr = needRoute.url.split('/').filter(function (elem) { return elem.length > 0; });

        needRouteUrlArr.forEach(function (elem, elemIndex) {
            // If parameter
            // Then add to initial data
            if (elem[0] === '{') {
                var paramPartArr = elem.replace(/[{}]/g, '').split(':');
                var paramKey = paramPartArr[0];
                var paramType = paramPartArr[1];
                var isTypeSuccess = true;
                if (paramType) {
                    switch (paramType) {
                        case 'guid':
                            isTypeSuccess = appHelper.isGuidValid(currentUrlArr[elemIndex]);

                            break;
                        case 'int':
                            isTypeSuccess = currentUrlArr[elemIndex] % 1 === 0;
                            if (isTypeSuccess) {
                                // Convert to integer type
                                currentUrlArr[elemIndex] = parseInt(currentUrlArr[elemIndex]);
                            }
                            break;
                        default:
                            // If no type then error
                            isTypeSuccess = false;
                            break;
                    }

                }

                if (isTypeSuccess) {
                    initialData[paramKey] = currentUrlArr[elemIndex];
                }
            }
        });

        console.log(initialData);
        return initialData;
    };

    historyHelper.pushState = function (url) {
        if (history.pushState) {
            history.pushState({}, '', '#' + url);
        }
    };

    return historyHelper;
});