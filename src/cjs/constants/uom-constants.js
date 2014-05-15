/** @module constants/uom-constants */

'use strict';

/**
 * UOM coefficients
 */
exports = {
	time : {
		sec : 1,
		min : 60,
		hr : 3600,
		d : 86400
	},
	volume : {
		m3 : 1,
		bbl : 0.159159637116027, //? approximately
		Mbbl : 159.159637116027, // 1 000 barrels
		MMbbl : 159159.637116027, // 1 000 000 barrels
		scf : 0.028316846592, // Math.Pow(0.3048, 3);
		Mcf : 28.316846592, // Math.Pow(0.3048, 3) * 1000
		MMcf : 28316.846592, // Math.Pow(0.3048, 3) * 1000000
		in3 : 0.000016387064, // Math.Pow(0.3048 / 12, 3);
		L : 0.001,
		galUS : 0.003785411784, // 231 * Math.Pow(0.3048 / 12, 3);// 231 * cui
		galUK : 0.00454609 // (4.54609 / 1000);//// official in litres
	},
	temperature : {
		'°F' : 1
	}
};

module.exports = exports;
