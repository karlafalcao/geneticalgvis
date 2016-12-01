var barsPlot = function (svgContainerId) {

    var svg = d3.select("#main")
        .append('svg')
        .attr('id', svgContainerId)
        .attr("width", 960)
        .attr("height", 500);

    var margin = {top: 20, right: 20, bottom: 110, left: 40},
        margin2 = {top: 430, right: 20, bottom: 30, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        height2 = +svg.attr("height") - margin2.top - margin2.bottom; //40px

    var parseDate = d3.timeParse("%d/%m/%Y");

    var colour = d3.scaleOrdinal()
                .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var x = d3.scaleTime().range([0, width]),
        x2 = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height2, 0]);

    var xAxis = d3.axisBottom(x),
        xAxis2 = d3.axisBottom(x2),
        yAxis = d3.axisLeft(y);

    var brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush end", brushed);

    svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // overview
    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    function parse(d) {
        d.date = new Date(d.date);
        return d;
    }
    var render = function(data){
        data.map(parse);

        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([0, d3.max(data, function(d) { return d.total; })]);
        x2.domain(x.domain());
        y2.domain(y.domain());
        colour.domain(d3.keys(data[0]));

        
        // draw the bars
        focus.append("g")
            .attr("class", "bars")
            .selectAll(".bar.stack")
            .data(data)
        .enter()
        .append("g")
        .attr("class", "bar stack")
        .attr("transform", function(d) { return "translate(" + x(d.date) + ",0)"; })
            .selectAll("rect")
            .data(function(d) { return d.counts; })
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("width", 6)
        .attr("y", function(d) { return y(d.y1); })
        .attr("height", function(d) { return y(d.y0) - y(d.y1); })
        .style("fill", function(d) { return colour(d.name); });


        focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        // draw bars
        context.append("g")
            .attr("class", "bars")
            .selectAll(".bar")
            .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x2(d.date) - 3; })
        .attr("width", 6)
        .attr("y", function(d) { return y2(d.total); })
        .attr("height", function(d) { return height2 - y2(d.total); });

        context.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "brush")
            .call(brush);
    };

    function brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        var s = d3.event.selection || x2.range();
        x.domain(s.map(x2.invert, x2));
        focus.selectAll(".bar.stack")
            .attr("transform", function(d) { return "translate(" + x(d.date) + ",0)"; })
        focus.select(".axis--x").call(xAxis);
    }

    function type(d) {
        d.date = parseDate(d.date);
        d.price = +d.price;
        return d;
    }

    return {
        render: render
    }
}