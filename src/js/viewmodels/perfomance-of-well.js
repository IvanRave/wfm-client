﻿/** @module */
define(['jquery',
		'knockout',
		'helpers/modal-helper',
		'moment',
		'models/column-attribute',
		'viewmodels/svg-graph',
		'd3',
		'viewmodels/wfm-parameter-of-wroup'
	], function ($, ko, modalHelper, appMoment, ColumnAttribute, SvgGraph, d3, VwmWfmParameterOfWroup) {
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
			var jqrSelectedRowList = $(fragmentTable).find('tr.selected-row');

			if (jqrSelectedRowList.length === 0) {
				alert('Please select a row, where data begins');
				return;
			}
			// end calculate

			// get all previous siblings before selected row
			var tmpCountOfRows = jqrSelectedRowList.prevAll().length;

			var isDateColumnExists = false;

			var needColumnListSelected = $.map(matchSelectList, function (arrElem, arrIndex) {
					var tmpNameElem = $(arrElem.matchNameElem).val();

					if (tmpNameElem) {

						if (tmpNameElem === 'Date') {
							isDateColumnExists = true;
						}

						var pdColumnAttr = new ColumnAttribute({
								Id : arrIndex,
								Name : tmpNameElem,
								Format : $(arrElem.matchFormatElem).val() + ($(arrElem.matchFormatElemDenominator).val() ? ("/" + $(arrElem.matchFormatElemDenominator).val()) : '')
							});

						return pdColumnAttr.toPlainJson();
					}
				});

			if (isDateColumnExists === false) {
				alert('Please choose a column for Date');
        return;
			}

			callbackToSend(needColumnListSelected, tmpCountOfRows);
			modalHelper.closeModalWideWindow();
		};

		modalHelper.openModalWideWindow(bodyDom, submitFunction, 'Please select values for columns');
	}

	/**
	 * Perfomance of well viewmodel (one well - one perfomance)
	 * @constructor
	 */
	var exports = function (mdlWell, vwmWell,
		koStartYear, koEndYear, koStartMonth, koEndMonth,
		koSlcAttrGroupId, koIsVisibleForecastData) {
     
		var vw = this;

		/** Getter for a parent */
		this.getVwmWell = function () {
			return vwmWell;
		};

    this.mdlWell = mdlWell;
    
		this.mdlPerfomanceOfWell = mdlWell.perfomanceOfWell;

		this.isVisibleForecastData = koIsVisibleForecastData;

		this.selectedPrfTableYear = ko.observable();
		this.selectPrfTableYear = function (selectedPrfTableYearItem) {
			vw.selectedPrfTableYear(selectedPrfTableYearItem);
		};

		this.monthList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

		this.WPDDateStartYear = koStartYear;
		this.WPDDateEndYear = koEndYear;
		this.WPDDateStartMonth = koStartMonth;
		this.WPDDateEndMonth = koEndMonth;

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

		this.WPDDateStartYear.subscribe(updateSelectedPrfTableYear);
		this.WPDDateEndYear.subscribe(updateSelectedPrfTableYear);

		/**
		 * Id of group (squad) of wfm parameters
		 * @type {string}
		 */
		this.selectedAttrGroupId = koSlcAttrGroupId;

		this.selectedAttrGroup = ko.computed({
				read : function () {
					var tmpWfmParamSquadList = ko.unwrap(vw.mdlPerfomanceOfWell.getWellObj().getRootMdl().wfmParamSquadList);

					var tmpAttrGroup = $.grep(tmpWfmParamSquadList, function (elemValue) {
							return elemValue.id === ko.unwrap(vw.selectedAttrGroupId);
						});

					if (tmpAttrGroup.length > 0) {
						return tmpAttrGroup[0];
					}
				},
				deferEvaluation : true
			});

		/**
		 * Select id of attribute group
		 */
		this.selectAttrGroupId = function (attrGroupId) {
			vw.selectedAttrGroupId(attrGroupId);
		};

		/**
		 * Recreate viewmodels for each perfomance of well
		 */
		this.listOfVwmWfmParameterOfWroup = ko.computed({
				read : function () {
					// List of params from a wroup model
					var tmpParams = ko.unwrap(this.mdlWell.getWellGroup().listOfWfmParameterOfWroup);
					return tmpParams.map(function (paramItem) {
						return new VwmWfmParameterOfWroup(paramItem);
					});
				},
				deferEvaluation : true,
				owner : this
			});

		/**
		 * List of selected viewmodels of parameters
		 * @type {Array.<module:viewmodels/wfm-parameter-of-wroup>}
		 */
		this.listOfSlcVwmWfmParameterOfWroup = ko.computed({
				read : function () {
					var resultArr = [];

					var tmpSelectedAttrGroup = ko.unwrap(vw.selectedAttrGroup);

					if (tmpSelectedAttrGroup) {
						var tmpListGlobal = ko.unwrap(vw.listOfVwmWfmParameterOfWroup);

						// list of parameter for selected squad
						var tmpSelectedWfmParameterList = ko.unwrap(tmpSelectedAttrGroup.wfmParameterList);

						// Select only parameter ids
						var tmpIdList = tmpSelectedWfmParameterList.map(function (ssgElem) {
								return ssgElem.id;
							});

						// return only well group wfm parameters in selected squad
						resultArr = tmpListGlobal.filter(function (wgpElem) {
								return $.inArray(wgpElem.mdlWfmParameterOfWroup.wfmParameterId, tmpIdList) >= 0;
							});
					}

					return resultArr;
				},
				deferEvaluation : true
			});

		/**
		 * Production data, filtered by date
		 */
		this.filteredByDateProductionDataSet = ko.computed({
				read : this.calcFilteredByDatePD,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Real time border: min and max values in unix time format
		 *    This time border other than WPDDateStartYear, EndYear (ant other selectable values)
		 */
		this.filteredByDateProductionDataSetTimeBorder = ko.computed({
				read : this.calcTimeBorder,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Real value border: min and max values of data in selected squad
		 */
		this.filteredByDateProductionDataSetValueBorder = ko.computed({
				read : this.calcValueBorder,
				deferEvaluation : true,
				owner : this
			});

		// =============================== Perfomance graph ================================
		/**
		 * Update perfomance graph data: graph path for selected regions (d3 line objects in one json object)
		 *    <return>{'WaterRate': d3Line, ...}</return>
		 */
		this.perfomancePaths = ko.computed({
				read : this.generatePerfomancePaths,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * A perfomance graph
		 * @type {module:viewmodels/svg-graph}
		 */
		this.prfmGraph = new SvgGraph(vw.filteredByDateProductionDataSetTimeBorder, vw.filteredByDateProductionDataSetValueBorder, vw.perfomancePaths);

		this.joinedYearList = ko.computed({
				read : function () {
					if (ko.unwrap(vw.isVisibleForecastData)) {
						return ko.unwrap(vw.mdlPerfomanceOfWell.forecastYearList).concat(ko.unwrap(vw.mdlPerfomanceOfWell.histYearList));
					} else {
						return ko.unwrap(vw.mdlPerfomanceOfWell.histYearList);
					}
				},
				deferEvaluation : true,
				owner : this
			});

		/**
		 * Remove all production data
		 */
		vw.removeWellProductionData = function () {
			if (confirm('{{capitalizeFirst lang.confirmToDelete}} all production data from well?')) {
				vw.mdlPerfomanceOfWell.deleteWellProductionData();
			}
		};
	};

	/**
	 * Select file and import perfomance data
	 */
	exports.prototype.importPerfomanceData = function () {
		var tmpStageKey = this.mdlWell.stageKey;
		// Open file manager
		this.getVwmWell().unzOfSlcVwmSectionFmg(tmpStageKey + '-perfomance');

		var tmpFmgrModal = this.getVwmWell().fmgrModal;

		var ths = this;

		// Calback for selected file
		function mgrCallback() {
			tmpFmgrModal.okError('');

			var tmpSlcVwmSection = ko.unwrap(ths.getVwmWell().slcVwmSectionFmg);

			if (!tmpSlcVwmSection) {
				throw new Error('No selected section');
			}

			// Select file from file manager
			var selectedFileSpecs = ko.unwrap(tmpSlcVwmSection.mdlSection.listOfFileSpec).filter(function (elem) {
					return ko.unwrap(elem.isSelected);
				});

			if (selectedFileSpecs.length !== 1) {
				tmpFmgrModal.okError('need to select one file');
				return;
			}

			var tmpSlcFileSpec = selectedFileSpecs[0];

			//console.log('slcSection', tmpSlcVwmSection.mdlSection.id);
			ths.mdlPerfomanceOfWell.getPerfomanceFragment(tmpStageKey, tmpSlcVwmSection.mdlSection.id, tmpSlcFileSpec.id, 0, 10, function (response) {
				var columnAttrList = ko.unwrap(ths.mdlPerfomanceOfWell.prdColumnAttributeList);
				console.log('clean columns: ', columnAttrList);
				// remove calculated attributes
				columnAttrList = columnAttrList.filter(function (arrElem) {
						return ko.unwrap(arrElem.IsCalc) === false;
					});

				var jsColumnAttrList = columnAttrList.map(function (elem) {
						return ko.toJS(elem);
					});

				// Hide window with files
				tmpFmgrModal.hide();

				// Open window with match table
				buildMatchTable(response, tmpSlcFileSpec.extension, jsColumnAttrList, function (tmpSlcColumnAttrList, tmpIndexOfStartRow) {
					console.log(tmpSlcColumnAttrList, tmpIndexOfStartRow);
					ths.mdlPerfomanceOfWell.postPerfomanceData(tmpStageKey,
						tmpSlcVwmSection.mdlSection.id,
						tmpSlcFileSpec.id,
						tmpIndexOfStartRow,
						tmpSlcColumnAttrList,
						function () {
						// update data after import
						ths.mdlPerfomanceOfWell.isLoadedHstProductionData(false);
						ths.mdlPerfomanceOfWell.getHstProductionDataSet();
					},
						function (jqXhr) {
						if (jqXhr.status === 422) {
							var resJson = jqXhr.responseJSON;
							require(['helpers/lang-helper'], function (langHelper) {
								var tmpProcessError = (langHelper.translate(resJson.message) || resJson.message);
								alert(tmpProcessError);
							});
						}
					});
				});
			});
		}

		// Add to observable
		tmpFmgrModal.okCallback(mgrCallback);

		// Notification
		tmpFmgrModal.okDescription('Please select a file to import');

		// Open file manager
		tmpFmgrModal.show();
	};

	/** Generate paths for a graph */
	exports.prototype.generatePerfomancePaths = function () {
		var resultArr = [];
		// Redraw data after changing a graph zoom
		var tmpZoomTransform = ko.unwrap(this.prfmGraph.zoomTransform);

		// Without zoom initization - do not redraw
		if (tmpZoomTransform) {
			// List of viewmodels with WFM parameters (units)
			var listOfVwmParam = ko.unwrap(this.listOfSlcVwmWfmParameterOfWroup);

			var tmpXScale = ko.unwrap(this.prfmGraph.scaleX),
			tmpYScale = ko.unwrap(this.prfmGraph.scaleY);

			if (tmpXScale && tmpYScale) {
				var tmpDataSet = ko.unwrap(this.filteredByDateProductionDataSet);

				listOfVwmParam.forEach(function (vwmParamItem) {
					// parameter id, like CSG, WaterRate ...
					var tmpIdOfParameter = vwmParamItem.mdlWfmParameterOfWroup.wfmParameterId;

					/**
					 * Create line with d3 lib
					 *    https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-line
					 */
					var generateLinePath = d3.svg.line()
						.interpolate('monotone') // monotone or linear
						.x(function (d) {
							return tmpXScale(new Date(d.unixTime * 1000));
						})
						.y(function (d) {
							return tmpYScale(
								$.isNumeric(ko.unwrap(d[tmpIdOfParameter])) ? (ko.unwrap(d[tmpIdOfParameter]) * ko.unwrap(ko.unwrap(vwmParamItem.mdlWfmParameterOfWroup.wfmParameter).uomCoef)) : null);
						});

					resultArr.push({
						prmPath : generateLinePath(tmpDataSet),
						prmStroke : ko.unwrap(vwmParamItem.mdlWfmParameterOfWroup.color),
						prmVisible : ko.unwrap(vwmParamItem.isVisible)
					});
				});
			}
		}

		return resultArr;
	};

	/** Calculate a value border */
	exports.prototype.calcValueBorder = function () {
		// Params viewmodels
		var tmpVwmList = ko.unwrap(this.listOfSlcVwmWfmParameterOfWroup);
		// Data
		var tmpDataList = ko.unwrap(this.filteredByDateProductionDataSet);

		// get max and min value to find coef for graph
		var minValue,
		maxValue;

		$.each(tmpDataList, function (prfIndex, prfElem) {
			$.each(tmpVwmList, function (clmIndex, clmElem) {
				if (ko.unwrap(clmElem.isVisible)) {
					var tmpMdl = clmElem.mdlWfmParameterOfWroup;
					if ($.isNumeric(ko.unwrap(prfElem[tmpMdl.wfmParameterId]))) {
						var tmpValue = ko.unwrap(prfElem[tmpMdl.wfmParameterId]) * ko.unwrap(tmpMdl.wfmParameter().uomCoef);
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
	};

	/** Calculate a time border */
	exports.prototype.calcTimeBorder = function () {
		var arr = ko.unwrap(this.filteredByDateProductionDataSet);
		if (arr.length === 0) {
			return [];
		}

		return [arr[arr.length - 1].unixTime, arr[0].unixTime];
	};

  /** Calculate data, filtered by date */
	exports.prototype.calcFilteredByDatePD = function () {
		var resultArr = [];

		var tmpHstProductionDataSet = ko.unwrap(this.mdlPerfomanceOfWell.hstProductionDataSet),
		tmpHistYearList = ko.unwrap(this.mdlPerfomanceOfWell.histYearList);

		if (tmpHstProductionDataSet.length > 0 && tmpHistYearList.length > 0) {
			// Forecast tmp
			var tmpDcaProductionDataSet = ko.unwrap(this.mdlPerfomanceOfWell.dcaProductionDataSet),
			tmpIsVisibleForecastData = ko.unwrap(this.isVisibleForecastData) ? true : false;

			var prdArray;
			if (tmpIsVisibleForecastData) {
				prdArray = tmpDcaProductionDataSet.concat(tmpHstProductionDataSet);
			} else {
				prdArray = tmpHstProductionDataSet;
			}

			// Set bound dates if undefined
			if (!ko.unwrap(this.WPDDateStartYear)) {
				this.WPDDateStartYear(tmpHistYearList[0]);
			}

			if (!ko.unwrap(this.WPDDateEndYear)) {
				this.WPDDateEndYear(tmpHistYearList[0]);
			}

			if (!ko.unwrap(this.WPDDateStartMonth)) {
				this.WPDDateStartMonth(1);
			}

			if (!ko.unwrap(this.WPDDateEndMonth)) {
				this.WPDDateEndMonth(12);
			}
			// ----
			// TODO: change WPDDate to right names
			var tmpStartYear = ko.unwrap(this.WPDDateStartYear),
			tmpEndYear = ko.unwrap(this.WPDDateEndYear),
			tmpStartMonth = ko.unwrap(this.WPDDateStartMonth),
			tmpEndMonth = ko.unwrap(this.WPDDateEndMonth);

			// Seconds from Unix Epoch
			var startUnixTime = new Date(Date.UTC(tmpStartYear, tmpStartMonth - 1, 1)).getTime() / 1000;
			var endUnixTime = new Date(Date.UTC(tmpEndYear, tmpEndMonth - 1, 1)).getTime() / 1000;

			resultArr = ko.utils.arrayFilter(prdArray, function (r) {
					return ((r.unixTime >= startUnixTime) && (r.unixTime <= endUnixTime));
				});
		}

		return resultArr;
	};

	return exports;
});
