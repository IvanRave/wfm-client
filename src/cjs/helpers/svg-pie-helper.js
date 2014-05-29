/** @module helpers/svg-pie */

'use strict';

var d3 = require('d3');

/**
 * Svg pie generator
 * @param {Array.<string>} colors - Ordered colors for data
 */
exports.drawPie = function (parentElem, data) {
	var width = 120,
	height = 120;
	var radius = Math.min(width, height) / 2;

	var colors = data.map(function (item) {
			return item.color;
		});

	var color = d3.scale.ordinal()
		.range(colors);

	var arc = d3.svg.arc()
		.outerRadius(radius - 10)
		.innerRadius(0);

	var pie = d3.layout.pie()
		.sort(null)
		.value(function (d) {
			return d.val;
		});

	var svg = d3.select(parentElem).append("svg")
		//.attr("width", "100%")
		// .attr("height", height)
		.attr("viewBox", "0, 0, " + width + ", " + height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	data.forEach(function (d) {
		d.val = +d.val;
	});

	var g = svg.selectAll(".arc")
		.data(pie(data))
		.enter().append("g")
		.attr("class", "arc");

	g.append("path")
	.attr("d", arc)
	.style("fill", function (d) {
		return color(d.data.lbl);
	});

	g.append("text")
	.attr("transform", function (d) {
		return "translate(" + arc.centroid(d) + ")";
	})
	.attr("dy", ".35em")
	.style("text-anchor", "middle")
	.attr('class', 'pie-text')
	.text(function (d) {
		return d.data.lbl;
	});
};

module.exports = exports;
