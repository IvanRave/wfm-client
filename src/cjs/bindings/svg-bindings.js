/** @module bindings/svg-bindings */
'use strict';

var $ = require('jquery');
var ko = require('knockout');
var d3 = require('d3');
var mapHelper = require('helpers/map-helper');
var appHelper = require('helpers/app-helper');
var svgPieHelper = require('helpers/svg-pie-helper');

/**
 * Graph axis
 */
ko.bindingHandlers.graphAxis = {
	update : function (element, valueAccessor) {
		var tmpAxis = ko.unwrap(valueAccessor());
		if (tmpAxis) {
			d3.select(element).call(tmpAxis);
			// alternative: tmpAxis($(element));
		}
	}
};

function graphPathsItem(pathsWrap, prmItem) {
	pathsWrap.append('path')
	.attr('class', 'svg-graph-path')
	.attr('stroke', prmItem.prmStroke)
	.attr('d', prmItem.prmPath)
	.attr('visible', prmItem.prmVisible)
	// The attribute 'visible' doesn't work always (with monitoring curves)
	.style('visibility', prmItem.prmVisible ? 'visible' : 'hidden');
}

/**
 * Update paths for perfomance graph
 */
ko.bindingHandlers.graphPaths = {
	update : function (element, valueAccessor) {
		// Array of graph parameters
		var prmArr = ko.unwrap(valueAccessor());

		if (!prmArr) {
			return;
		}

		// Group for putting paths
		var pathsWrap = d3.select(element);

		// Clear
		pathsWrap.text('');

		// Add new paths
		prmArr.forEach(graphPathsItem.bind(null, pathsWrap));
	}
};

/**
 * Update behavior for element when data are changed
 */
ko.bindingHandlers.svgZoomBehavior = {
	init : function (element, valueAccessor) {
		console.log('svgZoomBehavior bindind has executed');
		// zoom behavior
		var tmpZoomBehavior = ko.unwrap(valueAccessor());
		if (tmpZoomBehavior) {
			d3.select(element).call(tmpZoomBehavior);
		}
	}
};

/** Svg map */
ko.bindingHandlers.mapBinding = {
	init : function (element, valueAccessor) {
		var accessor = valueAccessor();

		// Only non-observable objects or initial states of objects
		// Image url and size doesn't change

		// Append image with map (only once on init event)
		d3.select(element).append('image')
		.attr('xlink:href', accessor.imgUrl)
		.attr('width', accessor.imgWidthVg)
		.attr('height', accessor.imgHeightVg);
	},
	update : function (element, valueAccessor) {
		// Working with observables values
		var accessor = valueAccessor();
		var idOfSlcMapTool = ko.unwrap(accessor.idOfSlcMapTool);
		var vwmWellMarkerToAdd = accessor.vwmWellMarkerToAdd;

		// Image size, in pixels
		var imgWidthPx = accessor.imgWidthPx;
		var imgHeightPx = accessor.imgHeightPx;

		var imgWidthVg = accessor.imgWidthVg;
		var imgHeightVg = accessor.imgHeightVg;

		var widthCoefVgToPx = accessor.widthCoefVgToPx;
		var heightCoefVgToPx = accessor.heightCoefVgToPx;

		var listOfVwmWellMarker = ko.unwrap(accessor.listOfVwmWellMarker);
		var wellMarkerRadius = ko.unwrap(accessor.wellMarkerRadius);
		// Draw well markers
		var d3GroupWrap = d3.select(element);

		var d3Image = d3GroupWrap.select('image');

		d3Image.on('click', function () {
			console.log(idOfSlcMapTool);
			if (idOfSlcMapTool !== 'marker') {
				console.log('no marker');
				return;
			}
			// this = d3Image
			var coords = d3.mouse(this);

			// Add marker and show adding dialog right of the map

			// Calculate coords on map image in pixels
			// realX / svgX = realWidth / svgWidth
			var realMarkerPos = {
				x : (coords[0]) * (imgWidthPx / imgWidthVg), // - imgStartPos.x
				y : (coords[1]) * (imgHeightPx / imgHeightVg) //  - imgStartPos.y
			};

			// Send to the server in PUT method (change well marker data)
			console.log('realMarkerPos', realMarkerPos);
			vwmWellMarkerToAdd.coords([appHelper.toFloatDec(realMarkerPos.x, 1), appHelper.toFloatDec(realMarkerPos.y, 1)]);
		});

		// Redraw all well markers: user can remove/add/change coords or any actions with markers outside of svg block
		// Clear all values
		d3GroupWrap.selectAll('circle').remove();

		// Add fresh values
		listOfVwmWellMarker.forEach(function (elem) {
			var tmpCoords = ko.unwrap(elem.mdlWellMarker.coords);
			mapHelper.drawWellMarker(
				tmpCoords[0] * widthCoefVgToPx,
				tmpCoords[1] * heightCoefVgToPx,
				ko.unwrap(elem.isSlc) ? 'well-marker_selected' : ko.unwrap(elem.mdlWellMarker.markerStyle),
				d3GroupWrap,
				wellMarkerRadius,
				function (endCoordX, endCoordY) {
				elem.mdlWellMarker.coords([
						appHelper.toFloatDec(endCoordX / widthCoefVgToPx, 1),
						appHelper.toFloatDec(endCoordY / heightCoefVgToPx, 1)]);
			});
		});

		if (ko.unwrap(vwmWellMarkerToAdd.coords)) {
			console.log('wellmarkertoadd', vwmWellMarkerToAdd);
			var tmpCoords = ko.unwrap(vwmWellMarkerToAdd.coords);

			mapHelper.drawWellMarker(
				tmpCoords[0] * widthCoefVgToPx,
				tmpCoords[1] * heightCoefVgToPx,
				vwmWellMarkerToAdd.markerStyle,
				d3GroupWrap,
				wellMarkerRadius,
				function (endCoordX, endCoordY) {
				vwmWellMarkerToAdd.coords([
						appHelper.toFloatDec(endCoordX / widthCoefVgToPx, 1),
						appHelper.toFloatDec(endCoordY / heightCoefVgToPx, 1)]);
			});
		}
	}
};

function updateWidth(accessor, element) {
	accessor.koSvgWidth($(element).parent().width());
}

/** svg (like perfomance graph or field map) */
ko.bindingHandlers.svgResponsive = {
	init : function (element, valueAccessor) {
		var accessor = valueAccessor();

		// When change window size - update svg size
		$(window).resize(updateWidth.bind(null, accessor, element));

		// When toggle left menu - update svg size
		accessor.tmpIsVisibleMenu.subscribe(updateWidth.bind(null, accessor, element));

		// Update initial
		updateWidth(accessor, element);
		// svg viewbox size need to init before creating of this element
	}
};

/** Svg pie, like Well Activity Statistics */
ko.bindingHandlers.svgPie = {
	update : function (element, valueAccessor) {
		var accessor = valueAccessor();

		var pieData = ko.unwrap(accessor.pieData);

		var tmpDiv = document.createElement('div');

		svgPieHelper.drawPie(tmpDiv, pieData);

		element.appendChild(tmpDiv);

		var resultWidth = $(tmpDiv).width();

		//console.log('resultSvg', resultWidth);
    
    // Resize like width
    $(tmpDiv).height(resultWidth);
	}
};

// No output, apply to KO object
