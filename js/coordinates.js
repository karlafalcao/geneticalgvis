var coordinatesPlot = function (svgContainerId) {
 	var svg = d3.select("#main")
        .append('svg')
        .attr('id', svgContainerId)
        .attr("width", 560)
        .attr("height", 300);

    var margin = {top: 20, right: 20, bottom: 110, left: 40},
        margin2 = {top: 430, right: 20, bottom: 30, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        height2 = +svg.attr("height") - margin2.top - margin2.bottom; //40px



































}