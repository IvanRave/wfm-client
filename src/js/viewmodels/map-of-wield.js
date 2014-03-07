/**
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
	 */
	var exports = function (mdlMapOfWield, koVidOfSlcVwmMapOfWield) {
		/** Alternative for this */
		var ths = this;

		this.mdlMapOfWield = mdlMapOfWield;

		/** View id === model id. CAUTION: few views from one model
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
    * A map engine object
    * @type {module:viewmodels/svg-map}
    */
    this.svgMap = new SvgMap();

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
				read : function () {
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
				},
				deferEvaluation : true
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

		/** Select map tool */
		this.selectMapTool = function (mapToolToSelect) {
			// Select id -> system automatically sets tool as selected
			ths.idOfSlcVwmMapTool(mapToolToSelect.id);
		};

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

		/** Select well marker */
		this.selectVwmWellMarker = function (vwmWellMarkerToSelect) {
			ths.slcVwmWellMarker(vwmWellMarkerToSelect);
			console.log('scale');
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

		/**
		 * Well marker to add
		 *    Set point on the map, show adding panel right of the map
		 * @type {Object}
		 */
		this.wellMarkerDataToAdd = {
			coords : ko.observable(),
			idOfWell : ko.observable()
		};

		/** Add well marker: different methods for different views */
		this.addWellMarkerToMap = function () {
			mdlMapOfWield.postWellMarker(ko.unwrap(ths.wellMarkerDataToAdd.idOfWell), ko.unwrap(ths.wellMarkerDataToAdd.coords));

			// Clear selection: if post is unsuccessful - then only show error
			ths.cancelAddingWellMarker();
		};

		/**
		 * Cancel adding: clear object to adding
		 */
		this.cancelAddingWellMarker = function () {
			ths.wellMarkerDataToAdd.coords(null);
			ths.wellMarkerDataToAdd.idOfWell(null);
		};

		/** Remove analog for model */
		this.removeVwmWellMarker = function (vwmWellMarkerToRemove) {
			if (confirm('{{capitalizeFirst lang.confirmToDelete}}?')) {
				mdlMapOfWield.removeWellMarker(vwmWellMarkerToRemove.mdlWellMarker);
			}
		};

		/**
		 * Zoom and translate for svg map: can be set from server or by user click or by mouse scroll. By default: 1
		 * @type {number}
		 */
		this.transformAttr = ko.observable({
				scale : 1,
				translate : [0, 0]
			});
	};

	return exports;
});
