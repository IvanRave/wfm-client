/** @module */
define(['jquery', 'knockout', 'd3'], function ($, ko, d3) {
	'use strict';

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
			prmArr.forEach(function (prmItem) {
				pathsWrap.append('path')
				.attr('class', 'svg-graph-path')
				.attr('stroke', prmItem.prmStroke)
				.attr('d', prmItem.prmPath)
				.attr('visible', prmItem.prmVisible)
				// The attribute 'visible' doesn't work always (with monitoring curves)
				.style('visibility', prmItem.prmVisible ? 'visible' : 'hidden');
			});
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

	/** Drag and drop for circles */
	function getDragSvgCircle(wellMarkerItem, widthCoefVgToPx, heightCoefVgToPx) {
		var imgBounds = {};
		// TODO: get radius from view
		var markerRadius = 8;
		var dragSvgCircle = d3.behavior.drag()
			////.origin()
			.on('dragstart', function () {
				// silence other listeners
				d3.event.sourceEvent.stopPropagation();

				var d3BoundImage = d3.select(this).select(function () {
						return this.parentNode;
					}).select('image');

				var boundCoords = {
					left : +d3BoundImage.attr('x'),
					right : +d3BoundImage.attr('x') + (+d3BoundImage.attr('width')),
					top : +d3BoundImage.attr('y'),
					bottom : +d3BoundImage.attr('y') + (+d3BoundImage.attr('height'))
				};

				imgBounds = boundCoords;
			})
			.on('drag', function () {
				// Change circle coords
				////console.log('event', d3.event.x, d3.event.y);
				////console.log('mouse', d3.mouse(this));
				var xNew = Math.max(Math.min(d3.event.x, imgBounds.right - markerRadius), imgBounds.left + markerRadius),
				yNew = Math.max(Math.min(d3.event.y, imgBounds.bottom - markerRadius), imgBounds.top + markerRadius);

				d3.select(this)
				.attr('cx', xNew)
				.attr('cy', yNew);
			})
			.on('dragend', function () {
				var tmpElem = d3.select(this);
				wellMarkerItem.coords([(+tmpElem.attr('cx') - imgBounds.left) / widthCoefVgToPx,
						(+tmpElem.attr('cy') - imgBounds.top) / heightCoefVgToPx]);

				////console.log(tmpCoords);
				////console.log(wellMarkerItem);
			});

		return dragSvgCircle;
	}

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
			var slcVwmWellMarker = ko.unwrap(accessor.slcVwmWellMarker);
			var wellMarkerDataToAdd = accessor.wellMarkerDataToAdd;

			// Image size, in pixels
			var imgWidthPx = accessor.imgWidthPx;
			var imgHeightPx = accessor.imgHeightPx;

			var imgWidthVg = accessor.imgWidthVg;
			var imgHeightVg = accessor.imgHeightVg;

			var coefVgToPx = {
				x : accessor.widthCoefVgToPx,
				y : accessor.heightCoefVgToPx
			};

			var listOfVwmWellMarker = ko.unwrap(accessor.listOfVwmWellMarker);
			var wellMarkerRadius = ko.unwrap(accessor.wellMarkerRadius);
			// Draw well markers
			var d3GroupWrap = d3.select(element);

			var d3Group = d3GroupWrap;// d3GroupWrap.select('g');

			var d3Image = d3Group.select('image');

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
				wellMarkerDataToAdd.coords([realMarkerPos.x, realMarkerPos.y]);
				//addWellMarker(realMarkerPos.x, realMarkerPos.y);
			});

			// Redraw all well markers: user can remove/add/change coords or any actions with markers outside of svg block
			// Clear all values
			d3Group.selectAll('circle').remove();

			function drawWellMarker(wellMarkerItem) {
				// Convert empty coords
				var wellMarkerCoordsInPx = ko.unwrap(wellMarkerItem.coords);

				console.log('wellMarkerCoordsInPx', wellMarkerCoordsInPx);

				if (!wellMarkerCoordsInPx[0] || !wellMarkerCoordsInPx[1]) {
					// set to the center of image
					wellMarkerCoordsInPx = [imgWidthPx / 2, imgHeightPx / 2];
				}

				/** In svg units (abbr: vg) */
				////var wellMarkerCoordsInVg = convertCoordsPxToVg(wellMarkerCoordsInPx, realImgSize, ..);
				//// F.E.: convert([300px, 300px], {width: 500px, height: 700px}, {width: 1200vg, height: 600vg, ratio: 2})
				////addWellMarker
				var tmpCx = wellMarkerCoordsInPx[0] * coefVgToPx.x; // + imgStartPos.x;
				var tmpCy = wellMarkerCoordsInPx[1] * coefVgToPx.y; // + imgStartPos.y;
				d3Group.append('circle')
				.attr('cx', tmpCx)
				.attr('cy', tmpCy)
				.attr('r', wellMarkerRadius)
				.attr('class', ko.unwrap(wellMarkerItem.markerStyle))
				.on('click', function () {
					// Show info about well in this point
					if (d3.event.defaultPrevented) {
						return;
					}
					//console.log('circle hoora', cx, cy);
				})
				.call(getDragSvgCircle(wellMarkerItem, coefVgToPx.x, coefVgToPx.y));
			}

			// Add fresh values
			listOfVwmWellMarker.forEach(function (elem) {
				drawWellMarker(elem.mdlWellMarker);
			});

			if (ko.unwrap(wellMarkerDataToAdd.coords)) {
				console.log('wellmarkertoadd', wellMarkerDataToAdd);
				drawWellMarker(wellMarkerDataToAdd, 'green');
			}

			console.log('slcWell: ', slcVwmWellMarker);
		}
	};

	/** svg (like perfomance graph or field map) */
	ko.bindingHandlers.svgResponsive = {
		init : function (element, valueAccessor) {
			var accessor = valueAccessor();

			function updateWidth() {
				accessor.koSvgWidth($(element).parent().width());
			}

			// When change window size - update svg size
			$(window).resize(updateWidth);

			// When toggle left menu - update svg size
			accessor.tmpIsVisibleMenu.subscribe(updateWidth);

			// Update initial
			updateWidth();
			// svg viewbox size need to init before creating of this element
		}
	};
});
