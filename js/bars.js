var barsPlot = function(svgContainerId) {

    var margin =  { top: 20, right: 20, bottom: 100, left: 20 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        marginOverview = { top: 430, right: margin.right, bottom: 20,  left: margin.left },
        heightOverview = 500 - marginOverview.top - marginOverview.bottom;

    var parseDate = d3.timeParse("%d/%m/%Y");

    var colour = d3.scaleOrdinal()
                        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var xOverview = d3.scaleTime().range([0, width]);
    var yOverview = d3.scaleLinear().range([heightOverview, 0]);

    // Axis
    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y);
    var xAxisOverview = d3.axisBottom(xOverview);

    // svg
    var svg = d3.select("#main")
                .append("svg")
                .attr('id', svgContainerId)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
    var main = svg.append("g")
                .attr("class", "main")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var overview = svg.append("g")
                .attr("class", "overview")
                .attr("transform", "translate(" + marginOverview.left + "," + marginOverview.top + ")");

    var brush = d3.brushX(xOverview)
            .extent([[0, 0], [width, heightOverview]])
            .on("end", brushed);

    var render = function(data){
        data.map(parse);

        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([0, d3.max(data, function(d) { return d.total; })]);

        xOverview.domain(x.domain());
        yOverview.domain(y.domain());

        colour.domain(d3.keys(data[0]));

        main.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        main.append("g")
            .attr("class", "y axis")
            .call(yAxis);
        overview.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + heightOverview + ")")
            .call(xAxisOverview);

        // draw the bars
        main.append("g")
                .attr("class", "bars")
            // a group for each stack of bars, positioned in the correct x position
            .selectAll(".bar.stack")
            .data(data)
            .enter().append("g")
                .attr("class", "bar stack")
                .attr("transform", function(d) { return "translate(" + x(d.date) + ",0)"; })
            // a bar for each value in the stack, positioned in the correct y positions
            .selectAll("rect")
            .data(function(d) { return d.counts; })
            .enter().append("rect")
                .attr("class", "bar")
                .attr("width", 6)
                .attr("y", function(d) { return y(d.y1); })
                .attr("height", function(d) { return y(d.y0) - y(d.y1); })
                .style("fill", function(d) { return colour(d.name); });

        overview.append("g")
                .attr("class", "bars")
            .selectAll(".bar")
            .data(data)
            .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return xOverview(d.date) - 3; })
                .attr("width", 6)
                .attr("y", function(d) { return yOverview(d.total); })
                .attr("height", function(d) { return heightOverview - yOverview(d.total); });

        // add the brush target area on the overview chart
        overview.append("g")
                    .attr("class", "x brush")
                    .call(brush)
                    .selectAll("rect")
                        .attr("y", -6)
                        .attr("height", heightOverview + 7);
    };

    function parse(d) {
        d.date = new Date(d.date);
        // var value = { date: parseDate(d.date) };

        // var y0 = 0;
        // value.counts = ["count", "count2", "count3"].map(function(name) {
        //     return { name: name,
        //              y0: y0,
        //              y1: y0 += +d[name]
        //            };
        // });
        // value.total = value.counts[value.counts.length - 1].y1;
        return d;
    }

    
    function brushed() {

        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom

        var s = d3.event.selection || xOverview.range();

        x.domain(s.map(xOverview.invert, xOverview));
        
        main.selectAll(".bar.stack")
            .attr("transform", function(d) { return "translate(" + x(d.date) + ",0)"; })

        main.select(".x.axis").call(xAxis);
    }

	return {
		render: render
	}
}