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
				.attr('visible', prmItem.prmVisible)
				.attr('d', prmItem.prmPath);
			});
		}
	};
  
  /**
  * Update behavior for element when data are changed
  */
	ko.bindingHandlers.graphZoom = {
		update : function (element, valueAccessor) {
			// zoom behavior
			var tmpZoomBehavior = ko.unwrap(valueAccessor());
			if (tmpZoomBehavior) {
				d3.select(element).call(tmpZoomBehavior);
			}
		}
	};

	/** Calculate svg image size using real size and svg block size */
	function calcSvgImgSize(realImgSize, svgBlockSize) {
		var svgImgSize = {};
		// If height is bigger side, then calculate width
		// if height = 600svg (400px) then width = Xsvg (300px)
		// X = (300px * 600svg) / 400px
		// else if width = 1200svg (300px) then height = Ysvg (400px)
		// Y = (400px * 1200svg) / 300px
		if ((realImgSize.height * svgBlockSize.ratio) > realImgSize.width) {
			svgImgSize.height = svgBlockSize.height;
			svgImgSize.width = (realImgSize.width * svgBlockSize.height) / realImgSize.height;
		} else {
			svgImgSize.width = svgBlockSize.width;
			svgImgSize.height = (realImgSize.height * svgBlockSize.width) / realImgSize.width;
		}

		return svgImgSize;
	}

	/** Drag and drop for circles */
	function getDragSvgCircle(wellMarkerItem, coefVgToPx) {
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
				wellMarkerItem.coords([(+tmpElem.attr('cx') - imgBounds.left) / coefVgToPx.x,
						(+tmpElem.attr('cy') - imgBounds.top) / coefVgToPx.y]);

				////console.log(tmpCoords);
				////console.log(wellMarkerItem);
			});

		return dragSvgCircle;
	}

	function getCoefVgToPx(imgSizeInPx, imgSizeInVg) {
		return {
			x : imgSizeInVg.width / imgSizeInPx.width,
			y : imgSizeInVg.height / imgSizeInPx.height
		};
	}

	/** Svg map */
	ko.bindingHandlers.svgMap = {
		init : function (element, valueAccessor) {
			var accessor = valueAccessor();

			// Only non-observable objects or initial states of objects
			// Image url doesn't change
			var imgUrl = ko.unwrap(accessor.imgUrl);
			var koTransformAttr = accessor.transformAttr;

			// Image size doesn't change, like {width: 300, height: 400}
			var realImgSize = ko.unwrap(accessor.imgSizePx);

			// Block (svg) size without margins (doesn't change)
			var svgBlockSize = ko.unwrap(accessor.svgBlockSize);

			// Calculate image size in svg viewbox
			var svgImgSize = calcSvgImgSize(realImgSize, svgBlockSize);

			var imgStartPos = {
				x : (svgBlockSize.width - svgImgSize.width) / 2,
				y : (svgBlockSize.height - svgImgSize.height) / 2
			};

			var d3GroupWrap = d3.select(element);

			var d3Group = d3GroupWrap.select('g');

			// Append image with map (only once on init event)
			d3Group.append('image')
			.attr('xlink:href', imgUrl)
			.attr('height', svgImgSize.height)
			.attr('width', svgImgSize.width)
			.attr('x', imgStartPos.x)
			.attr('y', imgStartPos.y);

			// Add zoom for all elements (group) only once on init event
			var x = d3.scale.linear().range([imgStartPos.x, imgStartPos.x + svgImgSize.width]);
			var y = d3.scale.linear().range([imgStartPos.y, imgStartPos.y + svgImgSize.height]);

			function zoomed() {
				koTransformAttr({
					scale : d3.event.scale,
					translate : d3.event.translate
				});
			}

			var zoom = d3.behavior.zoom()
				.x(x)
				.y(y)
				.scaleExtent([0.5, 15])
				.on('zoom', zoomed);

			function applyTransform(tmpTransform) {
				zoom.scale(tmpTransform.scale).translate(tmpTransform.translate);
				d3Group.attr('transform', 'translate(' + tmpTransform.translate.join(',') + ') scale(' + tmpTransform.scale + ')');
			}

			// Scroll -> zoomed method -> changed koTransform -> subscribe event -> apply zoom (again for scroll) -> set attr to group
			koTransformAttr.subscribe(applyTransform);

			// Default scale and translate: apply first time
			applyTransform(ko.unwrap(koTransformAttr));

			d3GroupWrap.call(zoom);
		},
		update : function (element, valueAccessor) {
			// Working with observables values
			var accessor = valueAccessor();
			var idOfSlcMapTool = ko.unwrap(accessor.idOfSlcMapTool);
			var slcVwmWellMarker = ko.unwrap(accessor.slcVwmWellMarker);
			var wellMarkerDataToAdd = accessor.wellMarkerDataToAdd;

			// Image size, in pixels
			var realImgSize = ko.unwrap(accessor.imgSizePx);

			// Block (svg) size without margins
			var svgBlockSize = ko.unwrap(accessor.svgBlockSize);

			// Calculate image size in svg viewbox
			var svgImgSize = calcSvgImgSize(realImgSize, svgBlockSize);

			var coefVgToPx = getCoefVgToPx(realImgSize, svgImgSize);

			console.log('coefVgToPx', coefVgToPx);

			var imgStartPos = {
				x : (svgBlockSize.width - svgImgSize.width) / 2,
				y : (svgBlockSize.height - svgImgSize.height) / 2
			};

			var listOfVwmWellMarker = ko.unwrap(accessor.listOfVwmWellMarker);
			var wellMarkerRadius = ko.unwrap(accessor.wellMarkerRadius);
			// Draw well markers
			var d3GroupWrap = d3.select(element);

			var d3Group = d3GroupWrap.select('g');

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
					x : (coords[0] - imgStartPos.x) * (realImgSize.width / svgImgSize.width),
					y : (coords[1] - imgStartPos.y) * (realImgSize.height / svgImgSize.height)
				};

				// Send to the server in PUT method (change well marker data)
				console.log('realMarkerPos', realMarkerPos);
				wellMarkerDataToAdd.coords([realMarkerPos.x, realMarkerPos.y]);
				//addWellMarker(realMarkerPos.x, realMarkerPos.y);
			});

			// Redraw all well markers: user can remove/add/change coords or any actions with markers outside of svg block
			// Clear all values
			d3Group.selectAll('circle').remove();

			function drawWellMarker(wellMarkerItem, fillColor) {
				// Convert empty coords
				var wellMarkerCoordsInPx = ko.unwrap(wellMarkerItem.coords);

				console.log('wellMarkerCoordsInPx', wellMarkerCoordsInPx);

				if (!wellMarkerCoordsInPx[0] || !wellMarkerCoordsInPx[1]) {
					// set to the center of image
					wellMarkerCoordsInPx = [realImgSize.width / 2, realImgSize.height / 2];
				}

				/** In svg units (abbr: vg) */
				////var wellMarkerCoordsInVg = convertCoordsPxToVg(wellMarkerCoordsInPx, realImgSize, svgBlockSize);
				//// F.E.: convert([300px, 300px], {width: 500px, height: 700px}, {width: 1200vg, height: 600vg, ratio: 2})
				////addWellMarker
				var tmpCx = wellMarkerCoordsInPx[0] * coefVgToPx.x + imgStartPos.x;
				var tmpCy = wellMarkerCoordsInPx[1] * coefVgToPx.y + imgStartPos.y;
				d3Group.append('circle')
				.attr('cx', tmpCx)
				.attr('cy', tmpCy)
				.attr('r', wellMarkerRadius)
				.attr('fill', fillColor)
				.attr('stroke', 'white')
				.on('click', function () {
					// Show info about well in this point
					if (d3.event.defaultPrevented) {
						return;
					}
					//console.log('circle hoora', cx, cy);
				})
				.call(getDragSvgCircle(wellMarkerItem, coefVgToPx));
			}

			// Add fresh values
			listOfVwmWellMarker.forEach(function (elem) {
				drawWellMarker(elem.mdlWellMarker, 'black');
			});

			if (ko.unwrap(wellMarkerDataToAdd.coords)) {
				console.log('wellmarkertoadd', wellMarkerDataToAdd);
				drawWellMarker(wellMarkerDataToAdd, 'green');
			}

			// Point and scale map to selected well marker
			////if (slcWellMarker) {
			////    ////// Set to the center and scale to 10 * 8 (marker radius) = 80units
			////    ////// Center of svg block
			////    var svgCenterCoords = [svgBlockSize.width / 2, svgBlockSize.height / 2];
			////    ////// Svg marker coords = Real marker coords (in pixels) -> Real marker coords (in svg units) + Image margin (in svg units)
			////    var wellMarkerCoordsInPx = ko.unwrap(slcWellMarker.coords);
			////    // TODO: change null values

			////    var wellMarkerCoordsInVg = [wellMarkerCoordsInPx[0] * coefVgToPx.x + imgStartPos.x, wellMarkerCoordsInPx[1] * coefVgToPx.y + imgStartPos.y];

			////    var transformCoords = [svgCenterCoords[0] - wellMarkerCoordsInVg[0], svgCenterCoords[1] - wellMarkerCoordsInVg[1]];

			////    d3Group.attr('transform', 'translate(' + transformCoords.join(',') + ')');
			////    // scale(' + 1 + ')'
			////}

			console.log('slcWell', slcVwmWellMarker);
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
