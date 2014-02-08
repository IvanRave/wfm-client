/** @module */
define(['jquery',
		'knockout',
		'd3',
		'helpers/modal-helper',
		'moment',
		'models/column-attribute'
	], function ($, ko, d3, modalHelper, appMoment, ColumnAttribute) {
	'use strict';

	function fromOAtoJS(oaDate) {
		var jsDate = new Date((parseFloat(oaDate) - 25569) * 24 * 3600 * 1000);
		return new Date(jsDate.getUTCFullYear(), jsDate.getUTCMonth(), jsDate.getUTCDate(), jsDate.getUTCHours(), jsDate.getUTCMinutes(), jsDate.getUTCSeconds());
	}

	function buildMatchTable(response, fileExtension, columnAttrList, callbackToSend) {
		console.log('column attributes without calc: ', columnAttrList);
		var bodyDom = document.createElement('div');
		$(bodyDom).css({
			'overflow' : 'auto'
		});
		var fragmentTable = document.createElement('tbody');
		var fragmentTableFoot = document.createElement('tfoot');
		var fragmentTableWrap = document.createElement('table');
		$(fragmentTableWrap).addClass('table-fragment').append(fragmentTableFoot, fragmentTable);
		////addClass('standart-table');
		bodyDom.appendChild(fragmentTableWrap);

		// last column index - to place matching select box for every column
		var maxColumnIndex = 0;

		var isFileExtensionTxt = fileExtension === '.txt';

		for (var i = 0, ilimit = response.length; i < ilimit; i++) {
			var fragmentTR = document.createElement('tr');
			var jlimit = response[i].length;

			maxColumnIndex = Math.max(maxColumnIndex, jlimit);

			// add first column as a data begin index selector
			for (var j = 0; j < jlimit; j++) {
				var fragmentTD = document.createElement('td');
				var cellText = response[i][j];
				// if not empty then add (0 value - stay in table)
				if (cellText !== null && cellText !== '') {
					if (j === 0 && isFileExtensionTxt === false) {
						// if date column (by agreement - it is first column)
						// try to convert to YYYY-MM-DD
						if (parseInt(cellText, 10) % 1 === 0) {
							// it is integer
							cellText = appMoment(fromOAtoJS(parseInt(cellText, 10))).format('YYYY-MM-DD');
						}
					}

					fragmentTD.appendChild(document.createTextNode(cellText));
				}

				fragmentTR.appendChild(fragmentTD);
			}

			fragmentTable.appendChild(fragmentTR);
		}

		// add ProdDays to columnAttr
		var prodDaysObj = {
			Name : 'ProdDays',
			NumeratorList : ['days']
		};

		columnAttrList.push(prodDaysObj);

		// add Date to columnAttr
		var dateObj = {
			Name : 'Date',
			NumeratorList : ['auto']
		};

		if (isFileExtensionTxt === true) {
			dateObj.NumeratorList = ['d-MMM-yy', 'dd-MMM-yy', 'yyyy-MM-dd', 'M/d/yyyy', 'dd-MM-yyyy', 'MM-dd-yyyy'];
		}

		columnAttrList.push(dateObj);

		// string with column names
		var sourceSelect = '<option></option>';

		for (var clm = 0; clm < columnAttrList.length; clm++) {
			sourceSelect += '<option val="' + columnAttrList[clm].Name + '">' + columnAttrList[clm].Name + '</option>';
		}

		// 1. set names
		// 2. after select - view volume + time + other
		// 3. after OK - get all names + get all formats + get column index
		// 4. and send to the server
		// string with column formats

		// matching column names
		var matchNameTR = document.createElement('tr');
		fragmentTableFoot.appendChild(matchNameTR);
		// matching column formats
		var matchFormatTR = document.createElement('tr');
		fragmentTableFoot.appendChild(matchFormatTR);

		// collection of select inputs
		var matchSelectList = [];
		// create all inputs and put in collection
		for (var z = 0; z < maxColumnIndex; z++) {
			var matchNameTD = document.createElement('td');
			////$(matchNameTD).addClass('wo-border');
			// select input for column match names
			var matchNameSelect = document.createElement('select');
			$(matchNameSelect).addClass('input-sm').html(sourceSelect);
			matchNameTD.appendChild(matchNameSelect);
			matchNameTR.appendChild(matchNameTD);

			// match formats (numerator)
			var matchFormatTD = document.createElement('td');
			// select input for column match names
			var matchFormatSelect = document.createElement('select');
			$(matchFormatSelect).addClass('input-sm').hide();
			matchFormatTD.appendChild(matchFormatSelect);
			matchFormatTR.appendChild(matchFormatTD);

			// match formats (denominator)
			var matchFormatSelectDenominator = document.createElement('select');
			$(matchFormatSelectDenominator).addClass('input-sm').hide();
			matchFormatTD.appendChild(matchFormatSelectDenominator);

			// add both select inputs to main collection
			matchSelectList.push({
				matchNameElem : matchNameSelect,
				matchFormatElem : matchFormatSelect,
				matchFormatElemDenominator : matchFormatSelectDenominator
			});
		}

		function fillSelectBoxes(event) {
			var choosedColumnName = $(event.currentTarget).val();

			if (!choosedColumnName) {
				// empty and hide format selectboxes
				$(matchSelectList[event.data.elemColumnIndex].matchFormatElem).html('').hide();
				$(matchSelectList[event.data.elemColumnIndex].matchFormatElemDenominator).html('').hide();
				return;
			}

			// select options to upper part (numerator)
			// get Format list of need element (first element)
			var columnAttrElement = $.grep(columnAttrList, function (arrElem) {
					// The filter function must return 'true' to include the item in the result array.
					return (arrElem.Name === choosedColumnName);
				})[0];

			var numeratorOptionList = '';
			// make select box from format list
			$.each(columnAttrElement.NumeratorList, function (frmIndex, frmElem) {
				numeratorOptionList += '<option value="' + frmElem + '">' + frmElem + '</option>';
			});

			$(matchSelectList[event.data.elemColumnIndex].matchFormatElem).html(numeratorOptionList).show();

			if (columnAttrElement.DenominatorList) {
				var denominatorOptionList = '';
				// make select box from format list
				$.each(columnAttrElement.DenominatorList, function (frmIndex, frmElem) {
					denominatorOptionList += '<option value="' + frmElem + '">' + frmElem + '</option>';
				});

				$(matchSelectList[event.data.elemColumnIndex].matchFormatElemDenominator).html(denominatorOptionList).show();
			} else {
				$(matchSelectList[event.data.elemColumnIndex].matchFormatElemDenominator).html('').hide();
			}
		}

		// Generate select-boxes with unit format from select-box with unit name
		for (var k = 0; k < matchSelectList.length; k += 1) {
			$(matchSelectList[k].matchNameElem).on('change', {
				elemColumnIndex : k
			}, fillSelectBoxes);
		}

		// clickable rows
		$(fragmentTable).find('tr').on('click', function () {
			$(this).siblings().removeClass('selected-row');
			$(this).addClass('selected-row');
		});

		// show all rows in modal window (or new tab)
		// show with header select (column name match, column format (divided to volume/time))
		var submitFunction = function () {
			// calculate beginRowIndex
			var $selectedRowList = $(fragmentTable).find('tr.selected-row');

			if ($selectedRowList.length === 0) {
				alert('Please select a row, where data begins');
				return;
			}
			// end calculate

			var needColumnListSelected = $.map(matchSelectList, function (arrElem, arrIndex) {
					if ($(arrElem.matchNameElem).val()) {
						var pdColumnAttr = new ColumnAttribute({
								Id : arrIndex,
								Name : $(arrElem.matchNameElem).val(),
								Format : $(arrElem.matchFormatElem).val() + ($(arrElem.matchFormatElemDenominator).val() ? ("/" + $(arrElem.matchFormatElemDenominator).val()) : '')
							});

						return pdColumnAttr.toPlainJson();
					}
				});

			// get all previous siblings before selected row
			var tmpCountOfRows = $selectedRowList.prevAll().length;

			callbackToSend(needColumnListSelected, tmpCountOfRows);
			modalHelper.closeModalWideWindow();
		};

		modalHelper.openModalWideWindow(bodyDom, submitFunction, 'Please select values for columns');
	}

	/**
	 * Perfomance of well viewmodel (one well - one perfomance)
	 * @constructor
	 */
	var exports = function (optns, mdlPerfomanceOfWell, vwmWell) {
		var vw = this;

		vw.mdlPerfomanceOfWell = mdlPerfomanceOfWell;

		vw.isVisibleForecastData = ko.observable(optns.isVisibleForecastData);

		vw.selectedPrfTableYear = ko.observable();
		vw.selectPrfTableYear = function (selectedPrfTableYearItem) {
			vw.selectedPrfTableYear(selectedPrfTableYearItem);
		};

		vw.monthList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

		vw.WPDDateStartYear = ko.observable(optns.startYear);
		vw.WPDDateEndYear = ko.observable(optns.endYear);
		vw.WPDDateStartMonth = ko.observable(optns.startMonth);
		vw.WPDDateEndMonth = ko.observable(optns.endMonth);

		function updateSelectedPrfTableYear() {
			var tmpWpdDateStartYear = ko.unwrap(vw.WPDDateStartYear),
			tmpWpdDateEndYear = ko.unwrap(vw.WPDDateEndYear),
			tmpSelectedPrfTableYear = ko.unwrap(vw.selectedPrfTableYear);

			if (tmpWpdDateStartYear && tmpWpdDateEndYear) {
				if (!tmpSelectedPrfTableYear || tmpSelectedPrfTableYear < tmpWpdDateStartYear || tmpSelectedPrfTableYear > tmpWpdDateEndYear) {
					vw.selectedPrfTableYear(tmpWpdDateStartYear);
				}
			}
		}

		vw.WPDDateStartYear.subscribe(updateSelectedPrfTableYear);
		vw.WPDDateEndYear.subscribe(updateSelectedPrfTableYear);

		// Id of group (squad) of wfm parameters
		// Can be set through options (optns) or using any html view
		vw.selectedAttrGroupId = ko.observable(optns.selectedAttrGroupId);

		vw.selectedAttrGroup = ko.computed({
				read : function () {
					var tmpWfmParamSquadList = ko.unwrap(mdlPerfomanceOfWell.getWellObj().getRootMdl().wfmParamSquadList);

					var tmpAttrGroup = $.grep(tmpWfmParamSquadList, function (elemValue) {
							return elemValue.id === ko.unwrap(vw.selectedAttrGroupId);
						});

					if (tmpAttrGroup.length > 0) {
						return tmpAttrGroup[0];
					}
				},
				deferEvaluation : true
			});

		vw.selectAttrGroupId = function (attrGroupId) {
			vw.selectedAttrGroupId(attrGroupId);
		};

		// Well group parameters for selected squad
		vw.selectedWroupWfmParameterList = ko.computed({
				read : function () {
					var resultArr = [];
					var tmpSelectedAttrGroup = ko.unwrap(vw.selectedAttrGroup);
					if (tmpSelectedAttrGroup) {
						// list of wg parameters for this well group
						var tmpWellGroupWfmParameterList = ko.unwrap(mdlPerfomanceOfWell.getWellObj().getWellGroup().wellGroupWfmParameterList);

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
				deferEvaluation : true
			});

		vw.filteredByDateProductionDataSet = ko.computed({
				read : function () {
					////if (!ko.unwrap(vw.WPDDateStartYear)) {

					////}
					var resultArr = [];

					var tmpHstProductionDataSet = ko.unwrap(mdlPerfomanceOfWell.hstProductionDataSet),
					tmpHistYearList = ko.unwrap(mdlPerfomanceOfWell.histYearList);

					if (tmpHstProductionDataSet.length > 0 && tmpHistYearList.length > 0) {
						// Forecast tmp
						var tmpDcaProductionDataSet = ko.unwrap(mdlPerfomanceOfWell.dcaProductionDataSet),
						tmpIsVisibleForecastData = ko.unwrap(vw.isVisibleForecastData) ? true : false;

						var prdArray;
						if (tmpIsVisibleForecastData) {
							prdArray = tmpDcaProductionDataSet.concat(tmpHstProductionDataSet);
						} else {
							prdArray = tmpHstProductionDataSet;
						}

						// Set bound dates if undefined
						if (!ko.unwrap(vw.WPDDateStartYear)) {
							vw.WPDDateStartYear(tmpHistYearList[0]);
						}

						if (!ko.unwrap(vw.WPDDateEndYear)) {
							vw.WPDDateEndYear(tmpHistYearList[0]);
						}

						if (!ko.unwrap(vw.WPDDateStartMonth)) {
							vw.WPDDateStartMonth(1);
						}

						if (!ko.unwrap(vw.WPDDateEndMonth)) {
							vw.WPDDateEndMonth(12);
						}
						// ----
						// TODO: change WPDDate to right names
						var tmpStartYear = ko.unwrap(vw.WPDDateStartYear),
						tmpEndYear = ko.unwrap(vw.WPDDateEndYear),
						tmpStartMonth = ko.unwrap(vw.WPDDateStartMonth),
						tmpEndMonth = ko.unwrap(vw.WPDDateEndMonth);

						// Seconds from Unix Epoch
						var startUnixTime = new Date(Date.UTC(tmpStartYear, tmpStartMonth - 1, 1)).getTime() / 1000;
						var endUnixTime = new Date(Date.UTC(tmpEndYear, tmpEndMonth - 1, 1)).getTime() / 1000;

						resultArr = ko.utils.arrayFilter(prdArray, function (r) {
								return ((r.unixTime >= startUnixTime) && (r.unixTime <= endUnixTime));
							});
					}

					return resultArr;
				},
				deferEvaluation : true
			});

		// Real time border: min and max values in unix time format
		// This time border other than WPDDateStartYear, EndYear (ant other selectable values)
		vw.filteredByDateProductionDataSetTimeBorder = ko.computed({
				read : function () {
					var arr = ko.unwrap(vw.filteredByDateProductionDataSet);
					if (arr.length === 0) {
						return [];
					}

					return [arr[arr.length - 1].unixTime, arr[0].unixTime];
				},
				deferEvaluation : true
			});

		// Real value border: min and max values of data in selected squad
		vw.filteredByDateProductionDataSetValueBorder = ko.computed({
				read : function () {
					// get max and min value to find coef for graph
					var minValue,
					maxValue;

					$.each(ko.unwrap(vw.filteredByDateProductionDataSet), function (prfIndex, prfElem) {
						$.each(ko.unwrap(vw.selectedWroupWfmParameterList), function (clmIndex, clmElem) {
							if (ko.unwrap(clmElem.isVisible)) {
								if ($.isNumeric(ko.unwrap(prfElem[clmElem.wfmParameterId]))) {
									var tmpValue = ko.unwrap(prfElem[clmElem.wfmParameterId]) * ko.unwrap(clmElem.wfmParameter().uomCoef);
									// init first values
									if (typeof minValue === 'undefined' || typeof maxValue === 'undefined') {
										minValue = maxValue = tmpValue;
									} else {
										if (tmpValue > maxValue) {
											maxValue = tmpValue;
										} else if (tmpValue < minValue) {
											minValue = tmpValue;
										}
									}
								}
							}
						});
					});

					// Plus (top and bottom) margin 5% - monotone function can be overdrawen out of graph wrap border
					if (typeof(minValue) !== 'undefined') {
						minValue -= minValue / 20;
						maxValue += maxValue / 20;
					}

					// Still can be undefined
					return [minValue, maxValue];
				},
				deferEvaluation : true
			});

		// =============================== Perfomance graph ================================
		vw.prfGraph = {
			// Width -> Height
			ratio : 1 / 3,
			// size, depended of svg viewbox: 1200/400 minus all margins
			viewBox : {
				width : 1110,
				height : 370,
				// divide by 80 or 20 (where scale)
				margin : {
					top : 10,
					right : 30,
					bottom : 20,
					left : 60
				},
			},
			axisSize : 10
		};

		// actual width of graph and x-axis
		// real size of svg
		vw.prfGraph.width = ko.observable();

		// actual height of graph and y-axis
		vw.prfGraph.height = ko.computed({
				read : function () {
					var tmpWidth = ko.unwrap(vw.prfGraph.width);
					if (tmpWidth && $.isNumeric(tmpWidth)) {
						return tmpWidth * vw.prfGraph.ratio;
					}
				},
				deferEvaluation : true
			});

		vw.prfGraph.axis = {
			x : d3.svg.axis().tickSize(-vw.prfGraph.viewBox.height),
			y : d3.svg.axis().orient('left').tickSize(-vw.prfGraph.viewBox.width)
		};

		// Min and max zoom coeficient - 1 by default - without zoom
		////vw.prfGraph.scaleBorder = [0.0001, 10000];

		vw.prfGraph.zoom = d3.behavior.zoom().scaleExtent([0.0001, 10000]);

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
					.range([0, vw.prfGraph.viewBox.width])
					.domain([new Date(timeBorder[0] * 1000), new Date(timeBorder[1] * 1000)]);

				var y = d3.scale.linear()
					.range([vw.prfGraph.viewBox.height, 0])
					.domain(valueBorder);

				vw.prfGraph.axis.x.scale(x);
				vw.prfGraph.axis.y.scale(y);

				vw.prfGraph.zoom.x(x).y(y);

				// tmp for axis ====================================
				////var altX = d3.time.scale()
				////        .domain([t1, t2])
				////        .range([t1, t2].map(d3.time.scale()
				////        .domain([t1, t2])
				////        .range([0, vw.prfGraph.viewBox.width])));
				// end tmp =================================

				$.each(paramList, function (paramIndex, paramElem) {
					var line = d3.svg.line()
						.interpolate('monotone') ////monotone //linear
						.x(function (d) {
							return x(new Date(d.unixTime * 1000));
						})
						.y(function (d) {
							return y(
								$.isNumeric(ko.unwrap(d[paramElem.wfmParameterId])) ? (ko.unwrap(d[paramElem.wfmParameterId]) * ko.unwrap(ko.unwrap(paramElem.wfmParameter).uomCoef)) : null);
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
		vw.productionDataSetSvgPath = ko.computed(function () {
				return getSvgPath(
					ko.unwrap(vw.selectedWroupWfmParameterList),
					ko.unwrap(vw.filteredByDateProductionDataSetTimeBorder),
					ko.unwrap(vw.filteredByDateProductionDataSetValueBorder));
			});

		vw.joinedYearList = ko.computed({
				read : function () {
					if (ko.unwrap(vw.isVisibleForecastData)) {
						return ko.unwrap(mdlPerfomanceOfWell.forecastYearList).concat(ko.unwrap(mdlPerfomanceOfWell.histYearList));
					} else {
						return ko.unwrap(mdlPerfomanceOfWell.histYearList);
					}
				},
				deferEvaluation : true
			});

		/**
		 * Select file and import perfomance data
		 * @todo fix: get cell's fragments #HM! (using GetFragmentCell2D -> move to file spec controller)
		 */
		vw.importPerfomanceData = function () {
			// Open file manager
			vwmWell.unzOfSlcVwmSectionFmg(vwmWell.mdlStage.stageKey + '-perfomance');

			// Calback for selected file
			function mgrCallback() {
				vwmWell.fmgr.okError('');

				var tmpSlcVwmSection = ko.unwrap(vwmWell.slcVwmSectionFmg);

				if (!tmpSlcVwmSection) {
					throw new Error('No selected section');
				}

				// Select file from file manager
				var selectedFileSpecs = ko.unwrap(tmpSlcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
						return ko.unwrap(elem.isSelected);
					});

				if (selectedFileSpecs.length !== 1) {
					vwmWell.fmgr.okError('need to select one file');
					return;
				}

				var tmpSlcFileSpec = selectedFileSpecs[0];

				//console.log('slcSection', tmpSlcVwmSection.mdlSection.id);
				mdlPerfomanceOfWell.getPerfomanceFragment(vwmWell.mdlStage.stageKey, tmpSlcVwmSection.mdlSection.id, tmpSlcFileSpec.id, 0, 10, function (response) {
					var columnAttrList = ko.unwrap(mdlPerfomanceOfWell.prdColumnAttributeList);
					console.log('clean columns: ', columnAttrList);
					// remove calculated attributes
					columnAttrList = columnAttrList.filter(function (arrElem) {
							return ko.unwrap(arrElem.IsCalc) === false;
						});

					var jsColumnAttrList = columnAttrList.map(function (elem) {
							return ko.toJS(elem);
						});
					// Hide window with files
					vwmWell.fmgr.hide();
					// Open window with match table
					buildMatchTable(response, tmpSlcFileSpec.extension, jsColumnAttrList, function (tmpSlcColumnAttrList, tmpIndexOfStartRow) {
						console.log(tmpSlcColumnAttrList, tmpIndexOfStartRow);
						mdlPerfomanceOfWell.postPerfomanceData(vwmWell.mdlStage.stageKey,
							tmpSlcVwmSection.mdlSection.id,
							tmpSlcFileSpec.id,
							tmpIndexOfStartRow,
							tmpSlcColumnAttrList,
							function () {
							// update data after import
							console.log('successfuly imported');
						});
					});
				});

				// ths.mdlStage.postIntegrity(selectedFileSpecs[0].id, ko.unwrap(selectedFileSpecs[0].name), '', function () {
				// // Success
				// ths.fmgr.hide();
				// }, function (jqXhr) {
				// // Error
				// if (jqXhr.status === 422) {
				// var resJson = jqXhr.responseJSON;
				// require(['helpers/lang-helper'], function (langHelper) {
				// var tmpProcessError = (langHelper.translate(resJson.errId) || '{{lang.unknownError}}');
				// ths.fmgr.okError(tmpProcessError);
				// });
				// }
				// });
			}

			// Add to observable
			vwmWell.fmgr.okCallback(mgrCallback);

			// Notification
			vwmWell.fmgr.okDescription('Please select a file to import');

			// Open file manager
			vwmWell.fmgr.show();
		};
	};

	return exports;
});
