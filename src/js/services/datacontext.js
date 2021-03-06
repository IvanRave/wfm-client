﻿define(['jquery', 'helpers/ajax-request'], function ($, ajaxRequest) {
    'use strict';

    function wellUrl(uqp) {
        return '{{conf.requrl}}/api/well/' + (uqp ? ('?' + $.param(uqp)) : '');
    }

    function wellHistoryUrl(uqp) {
        return '{{conf.requrl}}/api/wellhistory/' + (uqp ? ('?' + $.param(uqp)) : '');
    }

    function wellFieldMapAreaUrl(uqp) {
        return '{{conf.requrl}}/api/wellfieldmaparea/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    
    function userProfileUrl(uqp) {
        return '{{conf.requrl}}/api/userprofile/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function productionDataUrl(uqp) {
        return '{{conf.requrl}}/api/productiondata/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    
    function forecastEvolutionUrl(uqp) {
        return '{{conf.requrl}}/api/forecastevolution/' + (uqp ? ('?' + $.param(uqp)) : '');
    }
    function companyJobTypeUrl(companyId, jobTypeId) {
        return '{{conf.requrl}}/api/companies/' + companyId + '/job-types' + (jobTypeId ? ('/' + jobTypeId) : '');
    }

    function postWell(item) {
        return ajaxRequest('POST', wellUrl(), item);
    }

    function deleteWell(item) {
        return ajaxRequest('DELETE', wellUrl({ id: item.Id }));
    }

    // 6. Production data
    function getProductionData(urlQueryParams) {
        return ajaxRequest('GET', productionDataUrl(urlQueryParams));
    }

    function deleteWellProductionData(wellId) {
        return ajaxRequest('DELETE', productionDataUrl({ 'well_id': wellId }));
    }

    function getColumnAttributesLocal() {
        // scf - standart cubic feet
        // Mcf - Mega cubic feet
        // gph (US) - gallon per hour
        // gpd (UK) - gallon per day (imperial gallon - imp gal)
        // 1 gal (UK) = 4,54609 L
        // 1 gal (US) = 3,785411784 L = 231 in3
        // bbl - Oil barrel
        var volumeArr = ['bbl', 'Mbbl', 'MMbbl', 'scf', 'Mcf', 'MMcf', 'in3', 'm3', 'L', 'galUS', 'galUK'];
        var timeArr = ['d', 'hr', 'min', 'sec'];

        var arr = [
            { Id: 0, Name: 'WaterCut', Format: '%', Group: 'watercut', IsVisible: true, IsCalc: false, AssId: null, NumeratorList: ['%'], CurveColor: [121, 160, 193] },
            { Id: 1, Name: 'OilRate', Format: 'bbl/d', Group: 'rate', IsVisible: true, IsCalc: false, AssId: null, NumeratorList: volumeArr, DenominatorList: timeArr, CurveColor: [255, 204, 0] },
            { Id: 2, Name: 'WaterRate', Format: 'bbl/d', Group: 'rate', IsVisible: true, IsCalc: false, AssId: 10, NumeratorList: volumeArr, DenominatorList: timeArr, CurveColor: [20, 67, 106] },
            { Id: 3, Name: 'GasRate', Format: 'scf/d', Group: 'rate', IsVisible: true, IsCalc: false, AssId: null, NumeratorList: volumeArr, DenominatorList: timeArr, CurveColor: [131, 43, 51] },
            { Id: 4, Name: 'LiquidRate', Format: 'bbl/d', Group: 'rate', IsVisible: true, IsCalc: false, AssId: 11, NumeratorList: volumeArr, DenominatorList: timeArr, CurveColor: [3, 146, 0] },
            { Id: 5, Name: 'OilCum', Format: 'bbl', Group: 'cumulative', IsVisible: true, IsCalc: false, AssId: 13, NumeratorList: volumeArr, CurveColor: [255, 136, 0] },
            { Id: 6, Name: 'GasCum', Format: 'scf', Group: 'cumulative', IsVisible: true, IsCalc: false, AssId: 15, NumeratorList: volumeArr, CurveColor: [220, 20, 60] },
            { Id: 7, Name: 'WaterCum', Format: 'bbl', Group: 'cumulative', IsVisible: true, IsCalc: false, AssId: 14, NumeratorList: volumeArr, CurveColor: [64, 108, 145] },
            { Id: 8, Name: 'GOR', Format: 'scf/bbl', Group: 'gor', IsVisible: true, IsCalc: false, AssId: 12, NumeratorList: volumeArr, DenominatorList: volumeArr, CurveColor: [146, 0, 10] },
            { Id: 9, Name: 'LiquidCum', Format: 'bbl', Group: 'cumulative', IsVisible: true, IsCalc: false, AssId: 16, NumeratorList: volumeArr, CurveColor: [36, 101, 35] },

            { Id: 10, Name: 'CalcWaterRate', Format: 'bbl/d', Title: '= LiquidRate * WaterCut(%)', Group: 'rate', IsVisible: false, IsCalc: true, NumeratorList: volumeArr, DenominatorList: timeArr, CurveColor: [20, 67, 106] },
            { Id: 11, Name: 'CalcLiquidRate', Format: 'bbl/d', Title: '= WaterRate + OilRate', Group: 'rate', IsVisible: false, IsCalc: true, NumeratorList: volumeArr, DenominatorList: timeArr, CurveColor: [3, 146, 0] },
            { Id: 12, Name: 'CalcGOR', Format: 'scf/bbl', Title: '= (GasRate * 1000) / OilRate', Group: 'gor', IsVisible: false, IsCalc: true, NumeratorList: volumeArr, DenominatorList: volumeArr, CurveColor: [146, 0, 10] },
            { Id: 13, Name: 'CalcOilCum', Format: 'bbl', Title: '= OilRate * ProdDays + PREVIOUS(CalcOilCum)', Group: 'cumulative', IsVisible: false, IsCalc: true, NumeratorList: volumeArr, CurveColor: [255, 136, 0] },
            { Id: 14, Name: 'CalcWaterCum', Format: 'bbl', Title: '= WaterRate * ProdDays + PREVIOUS(CalcWaterCum)', Group: 'cumulative', IsVisible: false, IsCalc: true, NumeratorList: volumeArr, CurveColor: [64, 108, 145] },
            { Id: 15, Name: 'CalcGasCum', Format: 'scf', Title: '= GasRate * ProdDays + PREVIOUS(CalcGasCum)', Group: 'cumulative', IsVisible: false, IsCalc: true, NumeratorList: volumeArr, CurveColor: [220, 20, 60] },
            { Id: 16, Name: 'CalcLiquidCum', Format: 'bbl', Title: '= CalcLiquidRate * ProdDays + PREVIOUS(CalcLiquidRate)', Group: 'cumulative', IsVisible: false, IsCalc: true, NumeratorList: volumeArr, CurveColor: [36, 101, 35] }
        ];

        return arr;
    }

    // 8. WellHistory
    function getWellHistoryList(urlQueryParams) {
        return ajaxRequest('GET', wellHistoryUrl(urlQueryParams));
    }

    function postWellHistory(item) {
        return ajaxRequest('POST', wellHistoryUrl(), item);
    }

    function putWellHistory(wellHistoryData) {
        return ajaxRequest('PUT', wellHistoryUrl({ id: wellHistoryData.id }), wellHistoryData);
    }

    function deleteWellHistory(wellHistoryId) {
        return ajaxRequest('DELETE', wellHistoryUrl({ id: wellHistoryId }));
    }

    // 11. WellFieldMapArea
    function getWellFieldMapAreas(urlQueryParams) {
        return ajaxRequest('GET', wellFieldMapAreaUrl(urlQueryParams));
    }

    function saveNewWellFieldMapArea(item) {
        return ajaxRequest('POST', wellFieldMapAreaUrl(), item);
    }

    function saveChangedWellFieldMapArea(item) {
        return ajaxRequest('PUT', wellFieldMapAreaUrl({ 'id': item.Id }), item);
    }

    function deleteWellFieldMapArea(item) {
        return ajaxRequest('DELETE', wellFieldMapAreaUrl({ 'id': item.Id }));
    }

    // user profile
    function createUserProfile(data) {
        return new datacontext.userProfile(data); // from cabinet.model.js
    }

    function getUserProfile() {
        return ajaxRequest('GET', userProfileUrl());
    }

    function putUserProfile(data) {
        return ajaxRequest('PUT', userProfileUrl({ 'id': data.userId }), data);
    }

    // ================== forecast evolution
    function getForecastEvolution(wellId) {
        return ajaxRequest('GET', forecastEvolutionUrl({ well_id: wellId }));
    }

    function postForecastEvolution(forecastEvolution) {
        return ajaxRequest('POST', forecastEvolutionUrl(), forecastEvolution);
    }

    var datacontext = {
        // save objects in db
        postWell: postWell,
        // delete objects from db
        deleteWell: deleteWell,
        // ProductionData
        getProductionData: getProductionData,
        deleteWellProductionData: deleteWellProductionData,
        // ColumnAttribute
        getColumnAttributesLocal: getColumnAttributesLocal,
        // WellHistory
        getWellHistoryList: getWellHistoryList,
        postWellHistory: postWellHistory,
        putWellHistory: putWellHistory,
        deleteWellHistory: deleteWellHistory,
        // WellFieldMapArea
        getWellFieldMapAreas: getWellFieldMapAreas,
        saveNewWellFieldMapArea: saveNewWellFieldMapArea,
        saveChangedWellFieldMapArea: saveChangedWellFieldMapArea,
        deleteWellFieldMapArea: deleteWellFieldMapArea,
        // user profile
        createUserProfile: createUserProfile,
        getUserProfile: getUserProfile,
        putUserProfile: putUserProfile,
        // ... todo:
        getForecastEvolution: getForecastEvolution,
        postForecastEvolution: postForecastEvolution
    };

    datacontext.getJobTypeList = function (companyId) {
        return ajaxRequest('GET', companyJobTypeUrl(companyId));
    };

    datacontext.postCompanyJobType = function (companyId, jobTypeData) {
        return ajaxRequest('POST', companyJobTypeUrl(companyId), jobTypeData);
    };

    return datacontext;
});