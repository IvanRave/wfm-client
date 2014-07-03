/**
 * @module
 * @returns {!Object} Scope of methods to help working with maps
 */
define(['d3'], function (d3) {
	'use strict';

	/** Drag and drop for circles */
	function getDragSvgCircle(markerRadius, dragEndCallback) {
		var imgBounds = {};

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
				dragEndCallback((+tmpElem.attr('cx') - imgBounds.left),
					(+tmpElem.attr('cy') - imgBounds.top));
			});

		return dragSvgCircle;
	}

	var exports = {};

	/** Draw a marker on the map */
	exports.drawWellMarker = function (coordX,
		coordY,
		markerClass,
		d3Elem,
		wellMarkerRadius,
		dragEndCallback) {

		/** In svg units (abbr: vg) */
		////var wellMarkerCoordsInVg = convertCoordsPxToVg(wellMarkerCoordsInPx, realImgSize, ..);
		//// F.E.: convert([300px, 300px], {width: 500px, height: 700px}, {width: 1200vg, height: 600vg, ratio: 2})
		////addWellMarker

		d3Elem.append('circle')
		.attr('cx', coordX)
		.attr('cy', coordY)
		.attr('r', wellMarkerRadius)
		.attr('class', markerClass)
		.on('click', function () {
			// Show info about well in this point
			if (d3.event.defaultPrevented) {
				return;
			}
			//console.log('circle hoora', cx, cy);
		})
		.call(getDragSvgCircle(wellMarkerRadius, dragEndCallback));
	};

	return exports;
});
