define(['jquery',
    'knockout',
    'd3'
], function ($, ko, d3) {
    'use strict';

    function PerfomanceView(optns, prfPartial) {
        var prfv = this;

        prfv.prfPartial = prfPartial;

        prfv.isVisibleForecastData = ko.observable(optns.isVisibleForecastData);

        prfv.selectedPrfTableYear = ko.observable();
        prfv.selectPrfTableYear = function (selectedPrfTableYearItem) {
            prfv.selectedPrfTableYear(selectedPrfTableYearItem);
        };

        prfv.monthList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        prfv.WPDDateStartYear = ko.observable(optns.startYear);
        prfv.WPDDateEndYear = ko.observable(optns.endYear);
        prfv.WPDDateStartMonth = ko.observable(optns.startMonth);
        prfv.WPDDateEndMonth = ko.observable(optns.endMonth);

        prfv.prfGraph = {
            ratio: 1 / 3,
            // size, depended of svg viewbox
            viewBox: {
                width: 1110,
                height: 370,
                // divide by 80 or 20 (where scale)
                margin: {
                    top: 10,
                    right: 30,
                    bottom: 20,
                    left: 60
                },
            },
            axisSize: 10
        };

        // actual width of graph and x-axis
        // real size of svg
        prfv.prfGraph.width = ko.observable();

        // actual height of graph and y-axis
        prfv.prfGraph.height = ko.computed({
            read: function () {
                var tmpWidth = ko.unwrap(prfv.prfGraph.width);
                if (tmpWidth && $.isNumeric(tmpWidth)) {
                    return tmpWidth * prfv.prfGraph.ratio;
                }
            },
            deferEvaluation: true
        });

        function updateSelectedPrfTableYear() {
            var tmpWpdDateStartYear = ko.unwrap(prfv.WPDDateStartYear),
                tmpWpdDateEndYear = ko.unwrap(prfv.WPDDateEndYear),
                tmpSelectedPrfTableYear = ko.unwrap(prfv.selectedPrfTableYear);

            if (tmpWpdDateStartYear && tmpWpdDateEndYear) {
                if (!tmpSelectedPrfTableYear || tmpSelectedPrfTableYear < tmpWpdDateStartYear || tmpSelectedPrfTableYear > tmpWpdDateEndYear) {
                    prfv.selectedPrfTableYear(tmpWpdDateStartYear);
                }
            }
        }

        prfv.WPDDateStartYear.subscribe(updateSelectedPrfTableYear);
        prfv.WPDDateEndYear.subscribe(updateSelectedPrfTableYear);

        // Id of group (squad) of wfm parameters
        // Can be set through options (optns) or using any html view
        prfv.selectedAttrGroupId = ko.observable(optns.selectedAttrGroupId);

        prfv.selectedAttrGroup = ko.computed({
            read: function () {
                var tmpWfmParamSquadList = ko.unwrap(prfPartial.getWellObj().getWellGroup().getWellField().getWellRegion().getParentViewModel().wfmParamSquadList);

                var tmpAttrGroup = $.grep(tmpWfmParamSquadList, function (elemValue) {
                    return elemValue.id === ko.unwrap(prfv.selectedAttrGroupId);
                });

                if (tmpAttrGroup.length > 0) {
                    return tmpAttrGroup[0];
                }
            },
            deferEvaluation: true
        });

        prfv.selectAttrGroupId = function (attrGroupId) {
            prfv.selectedAttrGroupId(attrGroupId);
        };

        // Well group parameters for selected squad
        prfv.selectedWellGroupWfmParameterList = ko.computed({
            read: function () {
                var resultArr = [];
                var tmpSelectedAttrGroup = ko.unwrap(prfv.selectedAttrGroup);
                if (tmpSelectedAttrGroup) {
                    // list of wg parameters for this well group
                    var tmpWellGroupWfmParameterList = ko.unwrap(prfPartial.getWellObj().getWellGroup().wellGroupWfmParameterList);

                    // list of parameter for selected squad
                    var tmpSelectedWfmParameterList = ko.unwrap(tmpSelectedAttrGroup.wfmParameterList);

                    // Select only parameter ids
                    var tmpSelectedWfmParameterIdList = $.map(tmpSelectedWfmParameterList, function (ssgElem) {
                        return ssgElem.id;
                    });

                    // return only well group wfm parameters in selected squad
                    resultArr = $.grep(tmpWellGroupWfmParameterList, function (wgpElem) {
                        return $.inArray(wgpElem.wfmParameterId, tmpSelectedWfmParameterIdList) >= 0;
                    });
                }

                return resultArr;
            },
            deferEvaluation: true
        });

        prfv.filteredByDateProductionDataSet = ko.computed({
            read: function () {
                ////if (!ko.unwrap(prfv.WPDDateStartYear)) {

                ////}
                var resultArr = [];

                var tmpHstProductionDataSet = ko.unwrap(prfPartial.hstProductionDataSet),
                    tmpHistYearList = ko.unwrap(prfPartial.histYearList);

                if (tmpHstProductionDataSet.length > 0 && tmpHistYearList.length > 0) {
                    // Forecast tmp
                    var tmpDcaProductionDataSet = ko.unwrap(prfPartial.dcaProductionDataSet),
                        tmpIsVisibleForecastData = ko.unwrap(prfv.isVisibleForecastData) ? true : false;

                    var prdArray;
                    if (tmpIsVisibleForecastData) {
                        prdArray = tmpDcaProductionDataSet.concat(tmpHstProductionDataSet);
                    }
                    else {
                        prdArray = tmpHstProductionDataSet;
                    }

                    // Set bound dates if undefined
                    if (!ko.unwrap(prfv.WPDDateStartYear)) {
                        prfv.WPDDateStartYear(tmpHistYearList[0]);
                    }

                    if (!ko.unwrap(prfv.WPDDateEndYear)) {
                        prfv.WPDDateEndYear(tmpHistYearList[0]);
                    }

                    if (!ko.unwrap(prfv.WPDDateStartMonth)) {
                        prfv.WPDDateStartMonth(1);
                    }

                    if (!ko.unwrap(prfv.WPDDateEndMonth)) {
                        prfv.WPDDateEndMonth(12);
                    }
                    // ----
                    // TODO: change WPDDate to right names
                    var tmpStartYear = ko.unwrap(prfv.WPDDateStartYear),
                        tmpEndYear = ko.unwrap(prfv.WPDDateEndYear),
                        tmpStartMonth = ko.unwrap(prfv.WPDDateStartMonth),
                        tmpEndMonth = ko.unwrap(prfv.WPDDateEndMonth);

                    // Seconds from Unix Epoch
                    var startUnixTime = new Date(Date.UTC(tmpStartYear, tmpStartMonth - 1, 1)).getTime() / 1000;
                    var endUnixTime = new Date(Date.UTC(tmpEndYear, tmpEndMonth - 1, 1)).getTime() / 1000;

                    resultArr = ko.utils.arrayFilter(prdArray, function (r) {
                        return ((r.unixTime >= startUnixTime) && (r.unixTime <= endUnixTime));
                    });
                }

                return resultArr;
            },
            deferEvaluation: true
        });

        // Real time border: min and max values in unix time format
        // This time border other than WPDDateStartYear, EndYear (ant other selectable values)
        prfv.filteredByDateProductionDataSetTimeBorder = ko.computed({
            read: function () {
                var arr = ko.unwrap(prfv.filteredByDateProductionDataSet);
                if (arr.length === 0) { return []; }

                return [arr[arr.length - 1].unixTime, arr[0].unixTime];
            },
            deferEvaluation: true
        });

        // Real value border: min and max values of data in selected squad
        prfv.filteredByDateProductionDataSetValueBorder = ko.computed({
            read: function () {
                // get max and min value to find coef for graph
                var minValue, maxValue;

                $.each(ko.unwrap(prfv.filteredByDateProductionDataSet), function (prfIndex, prfElem) {
                    $.each(ko.unwrap(prfv.selectedWellGroupWfmParameterList), function (clmIndex, clmElem) {
                        if (ko.unwrap(clmElem.isVisible)) {
                            if ($.isNumeric(ko.unwrap(prfElem[clmElem.wfmParameterId]))) {
                                var tmpValue = ko.unwrap(prfElem[clmElem.wfmParameterId]) * ko.unwrap(clmElem.wfmParameter().uomCoef);
                                // init first values
                                if (typeof minValue === 'undefined' || typeof maxValue === 'undefined') {
                                    minValue = maxValue = tmpValue;
                                }
                                else {
                                    if (tmpValue > maxValue) { maxValue = tmpValue; }
                                    else if (tmpValue < minValue) { minValue = tmpValue; }
                                }
                            }
                        }
                    });
                });

                // Plus (top and bottom) margin 5% - monotone function can be overdrawen out of graph wrap border
                if (typeof (minValue) !== 'undefined') {
                    minValue -= minValue / 20;
                    maxValue += maxValue / 20;
                }

                // Still can be undefined
                return [minValue, maxValue];
            },
            deferEvaluation: true
        });

        prfv.prfAltX = ko.observable();
        prfv.prfAltY = ko.observable();

        function getSvgPath(paramList, timeBorder, valueBorder) {
            var resultJson = {};

            // Check parameter and data existence
            // dataSet.length > 0 &&
            if (paramList.length > 0 &&
                $.isNumeric(timeBorder[0]) &&
                $.isNumeric(timeBorder[1]) &&
                $.isNumeric(valueBorder[0]) &&
                $.isNumeric(valueBorder[1])) {

                var x = d3.time.scale()
                    .range([0, prfv.prfGraph.viewBox.width])
                    .domain([new Date(timeBorder[0] * 1000), new Date(timeBorder[1] * 1000)]);

                var y = d3.scale.linear()
                    .range([prfv.prfGraph.viewBox.height, 0])
                    .domain(valueBorder);

                prfv.prfAltX(x);
                prfv.prfAltY(y);

                // tmp for axis ====================================
                ////var altX = d3.time.scale()
                ////        .domain([t1, t2])
                ////        .range([t1, t2].map(d3.time.scale()
                ////        .domain([t1, t2])
                ////        .range([0, prfv.prfGraph.viewBox.width])));
                // end tmp =================================

                $.each(paramList, function (paramIndex, paramElem) {
                    var line = d3.svg.line()
                            .interpolate('monotone') ////monotone //linear
                            .x(function (d) { return x(new Date(d.unixTime * 1000)); })
                            .y(function (d) {
                                return y(
                                    $.isNumeric(ko.unwrap(d[paramElem.wfmParameterId])) ? (ko.unwrap(d[paramElem.wfmParameterId]) * ko.unwrap(ko.unwrap(paramElem.wfmParameter).uomCoef)) : null
                                );
                            });

                    resultJson[paramElem.wfmParameterId] = line;
                    ////resultJson[paramElem.wfmParameterId] = line(dataSet);
                    ////if (ko.unwrap(paramElem.isVisible) === true) {
                    //}
                });
            }

            return resultJson;
        }

        // Update perfomance graph data: graph path for selected regions (d3 line objects in one json object)
        ///<return>{'WaterRate': d3Line, ...}</return>
        prfv.productionDataSetSvgPath = ko.computed(function () {
            return getSvgPath(
                    ko.unwrap(prfv.selectedWellGroupWfmParameterList),
                    ko.unwrap(prfv.filteredByDateProductionDataSetTimeBorder),
                    ko.unwrap(prfv.filteredByDateProductionDataSetValueBorder));
        });

        prfv.joinedYearList = ko.computed({
            read: function () {
                if (ko.unwrap(prfv.isVisibleForecastData)) {
                    return ko.unwrap(prfPartial.forecastYearList).concat(ko.unwrap(prfPartial.histYearList));
                }
                else {
                    return ko.unwrap(prfPartial.histYearList);
                }
            },
            deferEvaluation: true
        });

        return prfv;
    }

    return {
        init: function (optns, prfPartialItem) {
            return new PerfomanceView(optns, prfPartialItem);
        }
    };
});