﻿/**
 * @module
 * @todo feat: add unit of measurement for a distance #34!
 *             <ul>
 *             <li>foot and meter
 *             <li>toggle between these units
 *             </ul>
 * @todo feat: add well marker color #34!
 *             <ul>
 *             <li>include marker color to company settings
 *             <li>like Oil/Gas/Water (Yellow/Gray/Blue)
 *             <li>and Active/InActive (well state) (green/red)
 *             <li>For example: Active Water Well - Blue marker with green stroke
 *             </ul>
 * @todo fix: #42! After updating a webpage, map does not shows (with KnockoutJs v3.1.0)
 */
define(['knockout',
		'viewmodels/map-tool',
		'viewmodels/well-marker-of-map-of-wield',
		'viewmodels/svg-map'],
	function (ko,
		VwmMapTool,
		VwmWellMarker,
		SvgMap) {
	'use strict';

	var usualMapTools = [{
			id : 'hand',
			name : '{{capitalizeFirst lang.mapToolHand}}',
			icon : 'glyphicon glyphicon-hand-up',
			isPublicTool : true
		},
		////{
		////    id: 'ruler',
		////    name: '{{capitalizeFirst lang.mapToolRuler}}',
		////    icon: 'glyphicon glyphicon-resize-full',
		////    isPublicTool: true
		////},
		{
			id : 'marker',
			name : '{{capitalizeFirst lang.mapToolWellMarker}}',
			icon : 'glyphicon glyphicon-map-marker',
			isPublicTool : false
		}
		////{
		////    id: 'area',
		////    name: '{{capitalizeFirst lang.mapToolArea}}',
		////    icon: 'glyphicon glyphicon-retweet',
		////    isPublicTool: false
		////},
		////{
		////    id: 'scale',
		////    name: '{{capitalizeFirst lang.mapToolScale}}',
		////    icon: 'glyphicon glyphicon-screenshot',
		////    isPublicTool: false
		////}
	];

	/** Calculate svg image size using real size and svg block size */
	function calcSvgImgSize(realImgSize, vboxWidth, vboxHeight, vboxRatio) {
		var svgImgSize = {};
		// If height is bigger side, then calculate width
		// if height = 600svg (400px) then width = Xsvg (300px)
		// X = (300px * 600svg) / 400px
		// else if width = 1200svg (300px) then height = Ysvg (400px)
		// Y = (400px * 1200svg) / 300px
		if ((realImgSize.height / vboxRatio) > realImgSize.width) {
			svgImgSize.height = vboxHeight;
			svgImgSize.width = (realImgSize.width * vboxHeight) / realImgSize.height;
		} else {
			svgImgSize.width = vboxWidth;
			svgImgSize.height = (realImgSize.height * vboxWidth) / realImgSize.width;
		}

		return svgImgSize;
	}

	function getCoefVgToPx(imgSizeInPx, imgSizeInVg) {
		return {
			x : imgSizeInVg.width / imgSizeInPx.width,
			y : imgSizeInVg.height / imgSizeInPx.height
		};
	}

	/**
	 * View for well field map: contains selected objects, zoom, translate options
	 * @constructor
   * @param {module:models/map-of-wield} mdlMapOfWield - Model of this map
   * @param {string} koVidOfSlcVwmMapOfWield - Id of selected viewmodel
   * @param {number} optScale - Map scale
   * @param {Array} optTranslate - Map translate
	 */
	var exports = function (mdlMapOfWield, koVidOfSlcVwmMapOfWield, optScale, optTranslate) {
		/** Alternative for this */
		var ths = this;

		/**
		 * Model of map
		 */
		this.mdlMapOfWield = mdlMapOfWield;

		/**
		 * View id === model id. CAUTION: few views from one model
		 * @type {number}
		 */
		this.vid = mdlMapOfWield.id;

		/**
		 * Name link to model: need for options list
		 * @type {string}
		 */
		this.name = mdlMapOfWield.name;

		/**
		 * Whether view is selected
		 * @type {boolean}
		 */
		this.isSlcVwmMapOfWield = ko.computed({
				read : function () {
					return ths.vid === ko.unwrap(koVidOfSlcVwmMapOfWield);
				},
				deferEvaluation : true
			});

		/** Filtered and sorted areas */
		this.handledAreas = ko.computed({
				read : function () {
					return ko.unwrap(mdlMapOfWield.areas);
				},
				deferEvaluation : true
			});

		/**
		 * Id of selected tool
		 * @type {string}
		 */
		this.idOfSlcVwmMapTool = ko.observable();

		/**
		 * Selected tool: wellMarker, area, ruler, set scale, etc.
		 * @type {string}
		 */
		this.slcMapTool = ko.computed({
				read : this.getSlcMapTool,
				deferEvaluation : true,
				owner : true
			});

		/**
		 * Map tools
		 * @type {Array.<module:models/map-tool>}
		 */
		this.mapTools = ko.computed({
				read : function () {
					return usualMapTools.map(function (elem) {
						return new VwmMapTool(elem, ths.idOfSlcVwmMapTool);
					});
				},
				deferEvaluation : true
			});

		/**
		 * List of viewmodels of well markers
		 * @type {Array.<module:viewmodels/well-marker-of-map-of-wield>}
		 */
		this.listVwmWellMarker = ko.computed({
				read : function () {
					return ko.unwrap(mdlMapOfWield.wellMarkers).map(function (elem) {
						return new VwmWellMarker(elem, ths.slcVwmWellMarker);
					});
				},
				deferEvaluation : true
			});

		/**
		 * Selected well marker
		 * @type {module:models/well-marker-of-map-of-wield}
		 */
		this.slcVwmWellMarker = ko.observable();

		/**
		 * Image (map) size in pixels
		 * @type {Object}
		 */
		this.imgSizePx = ko.computed({
				read : function () {
					var tmpFileSpec = ths.mdlMapOfWield.fileSpec;

					return {
						width : ko.unwrap(tmpFileSpec.imgWidth),
						height : ko.unwrap(tmpFileSpec.imgHeight)
					};
				},
				deferEvaluation : true
			});

		/**
		 * A map engine object
		 * @type {module:viewmodels/svg-map}
		 */
		this.svgMap = new SvgMap();

		/**
		 * Zoom and translate for svg map: can be set from server or by user click or by mouse scroll. By default: 1
		 * @type {number}
		 */
		this.transformAttr = ko.observable({
				scale : optScale || 1,
				translate : optTranslate || [0, 0]
			});

		/**
		 * Well marker to add
		 *    Set point on the map, show adding panel right of the map
		 * @type {Object}
		 */
		this.wellMarkerDataToAdd = {
			coords : ko.observable(),
			idOfWell : ko.observable()
		};
	};

	/**
	 * Get selected map tool
	 */
	exports.prototype.getSlcMapTool = function () {
		var ths = this;
		var tmpMapTools = ko.unwrap(ths.mapTools);
		if (tmpMapTools.length > 0) {
			var tmpId = ko.unwrap(ths.idOfSlcVwmMapTool);

			if (tmpId) {
				return tmpMapTools.filter(function (elem) {
					return elem.id === tmpId;
				})[0];
			} else {
				// If no id - return first tool: by default: hand
				// and set to id
				ths.idOfSlcVwmMapTool(tmpMapTools[0].id);
				return tmpMapTools[0];
			}
		}
	};

	/** Select map tool */
	exports.prototype.selectMapTool = function (mapToolToSelect) {
		// Select id -> system automatically sets tool as selected
		this.idOfSlcVwmMapTool(mapToolToSelect.id);
	};

	/** Add well marker: different methods for different views */
	exports.prototype.addWellMarkerToMap = function () {
		this.mdlMapOfWield.postWellMarker(ko.unwrap(this.wellMarkerDataToAdd.idOfWell),
			ko.unwrap(this.wellMarkerDataToAdd.coords));

		// Clear selection: if post is unsuccessful - then only show error
		this.cancelAddingWellMarker();
	};

	/**
	 * Cancel adding: clear object to adding
	 */
	exports.prototype.cancelAddingWellMarker = function () {
		this.wellMarkerDataToAdd.coords(null);
		this.wellMarkerDataToAdd.idOfWell(null);
	};

	/** Remove analog for model */
	exports.prototype.removeVwmWellMarker = function (vwmWellMarkerToRemove) {
		if (confirm('{{capitalizeFirst lang.confirmToDelete}}?')) {
			this.mdlMapOfWield.removeWellMarker(vwmWellMarkerToRemove.mdlWellMarker);
		}
	};

	/** Select well marker */
	exports.prototype.selectVwmWellMarker = function (vwmWellMarkerToSelect) {
		var ths = this;
		ths.slcVwmWellMarker(vwmWellMarkerToSelect);

		// Set to the center and scale to 10 * 8 (marker radius) = 80units
		// Center of svg block: method from SvgBlock prototype
		var svgCenterCoords = ths.svgMap.getVboxCenter();
		console.log('Center coords of this map: ', svgCenterCoords);
		// Svg marker coords = Real marker coords (in pixels) -> Real marker coords (in svg units) + Image margin (in svg units)
		var wellMarkerCoordsInPx = ko.unwrap(vwmWellMarkerToSelect.mdlWellMarker.coords);
		// TODO: change null values
		var tmpImgSizePx = ko.unwrap(ths.imgSizePx);

		// Image size in vg units
		var tmpImgSizeVg = calcSvgImgSize(tmpImgSizePx,
				ths.svgMap.vboxOutSize.width,
				ths.svgMap.vboxOutSize.height,
				ths.svgMap.ratio);

		var coefVgToPx = getCoefVgToPx(tmpImgSizePx, tmpImgSizeVg);

		var imgStartPos = {
			x : (ths.svgMap.vboxOutSize.width - tmpImgSizeVg.width) / 2,
			y : (ths.svgMap.vboxOutSize.height - tmpImgSizeVg.height) / 2
		};

		var wellMarkerCoordsInVg = [wellMarkerCoordsInPx[0] * coefVgToPx.x + imgStartPos.x, wellMarkerCoordsInPx[1] * coefVgToPx.y + imgStartPos.y];

		var transformCoords = [svgCenterCoords[0] - wellMarkerCoordsInVg[0], svgCenterCoords[1] - wellMarkerCoordsInVg[1]];

		ths.transformAttr({
			scale : 1,
			translate : transformCoords
		});
	};

	return exports;
});
