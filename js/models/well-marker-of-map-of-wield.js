/** @module */
define(['knockout',
		'services/well-marker-of-map-of-wield'],
	function (ko,
		wellMarkerService) {

	/**
	 * Model: well in map of well field
	 * @constructor
	 */
	var exports = function (data, wellFieldMap) {
		data = data || {};

		/** Getter for a map parent */
		this.getWellFieldMap = function () {
			return wellFieldMap;
		};

		/**
		 * Pixels from top-left of map image (1. longitude and 2.latitude)
		 * @type {Array}
		 */
		this.coords = ko.observable([data.CoordX, data.CoordY]);

		/**
		 * Whether this well is drilled on this map (active)
		 * @type {boolean}
		 */
		this.isDrilled = ko.observable(data.IsDrilled);

		/**
		 * Id of map
		 * @type {number}
		 */
		this.idOfMapOfWield = data.IdOfMapOfWield;

		/**
		 * Id of well
		 * @type {number}
		 */
		this.idOfWell = data.IdOfWell;

		/**
		 * A style of the marker, depend from whether drilled
		 * @type {string}
		 */
		this.markerStyle = ko.computed({
				read : this.calcMarkerStyle,
				deferEvaluation : true,
				owner : this
			});

		////var tileLength = 255;
		////var mapCoordScale = Math.max(ths.getWellFieldMap().Width, ths.getWellFieldMap().Height) / tileLength;

		////this.coordX = ko.computed(function () {
		////    return ths.latitude() * mapCoordScale;
		////});

		////this.coordY = ko.computed(function () {
		////    return (tileLength - ths.longitude()) * mapCoordScale;
		////});

		////var tileLength = 255;
		////var coordX = 0, coordY = 0;
		////// if width > height
		////var mapCoordScale = Math.max(ths.Width, ths.Height) / tileLength;

		////coordX = latitude * mapCoordScale;
		////coordY = (tileLength - longitude) * mapCoordScale;

		/**
		 * Well name
		 * @type {string}
		 */
		this.wellName = ko.computed({
				read : this.calcWellName,
				deferEvaluation : true,
				owner : this
			});

		/**
		 * A name of the map
		 * @type {string}
		 */
		this.nameOfMap = ko.computed({
				read : this.calcNameOfMap,
				deferEvaluation : true,
				owner : this
			});

		/** Save coords when change */
		this.coords.subscribe(this.save, this);

		////this.toPlainJson = function () { return ko.toJS(ths); };
	};

	/** Calculate a name of the map (parent) */
	exports.prototype.calcNameOfMap = function () {
		return ko.unwrap(this.getWellFieldMap().name);
	};

	/** Save marker */
	exports.prototype.save = function () {
		var ths = this;
		wellMarkerService.put(ths.idOfMapOfWield, ths.idOfWell, {
			'IdOfMapOfWield' : ths.idOfMapOfWield,
			'IdOfWell' : ths.idOfWell,
			'CoordX' : ko.unwrap(ths.coords)[0],
			'CoordY' : ko.unwrap(ths.coords)[1],
			'IsDrilled' : ko.unwrap(ths.isDrilled)
		});
	};

	/** Calculate a style for the marker */
	exports.prototype.calcMarkerStyle = function () {
		var tmpIsDrilled = ko.unwrap(this.isDrilled);
		if (tmpIsDrilled === true) {
			return 'well-marker_drilled';
		} else if (tmpIsDrilled === false) {
			return 'well-marker_non-drilled';
		} else {
      // Pre-created markers
			return 'well-marker_pre-created';
		}
	};

	/** Calculate a name of the well */
	exports.prototype.calcWellName = function () {
		var tmpWell = this.getWell();
		if (tmpWell) {
			return ko.unwrap(tmpWell.Name);
		}
	};

	/** Get well for this marker */
	exports.prototype.getWell = function () {
		var wellFieldItem = this.getWellFieldMap().getWellField();
		var listOfWroup = ko.unwrap(wellFieldItem.wroups);
		var tmpIdOfWell = this.idOfWell;
		for (var keyOfWroup = 0; keyOfWroup < listOfWroup.length; keyOfWroup += 1) {
			var listOfWell = ko.unwrap(listOfWroup[keyOfWroup].wells);
			for (var keyOfWell = 0; keyOfWell < listOfWell.length; keyOfWell += 1) {
				if (listOfWell[keyOfWell].id === tmpIdOfWell) {
					return listOfWell[keyOfWell];
				}
			}
		}

		return null;
	};

	return exports;
});
