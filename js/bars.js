var barsPlot = function() {

	// sizing information, including margins so there is space for labels, etc
    var margin =  { top: 20, right: 20, bottom: 100, left: 20 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        marginOverview = { top: 430, right: margin.right, bottom: 20,  left: margin.left },
        heightOverview = 500 - marginOverview.top - marginOverview.bottom;

    // set up a date parsing function for future use
    var parseDate = d3.timeParse("%d/%m/%Y");

    // some colours to use for the bars
    var colour = d3.scaleOrdinal()
                        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    // mathematical scales for the x and y axes
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var xOverview = d3.scaleTime().range([0, width]);
    var yOverview = d3.scaleLinear().range([heightOverview, 0]);

    // Axis
    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y);
    var xAxisOverview = d3.axisBottom(xOverview);

    // svg
    var svg = d3.select("body")
	            .append("svg") // the overall space
	            .attr("width", width + margin.left + margin.right)
	            .attr("height", height + margin.top + margin.bottom);
    var main = svg.append("g")
                .attr("class", "main")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var overview = svg.append("g")
                .attr("class", "overview")
                .attr("transform", "translate(" + marginOverview.left + "," + marginOverview.top + ")");

    // brush tool to let us zoom and pan using the overview chart
	var brush = d3.brushX(xOverview)
    		.extent([[0, 0], [width, heightOverview]])
        	// .on("end", brushended)
            .on("end", brushed);

	var render = function(data){
		// var teste1 = data[0]
		data.map(parse);

 		// data ranges for the x and y axes
        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([0, d3.max(data, function(d) { return d.total; })]);

        xOverview.domain(x.domain());
        yOverview.domain(y.domain());

        // data range for the bar colours
        // (essentially maps attribute names to colour values)
        colour.domain(d3.keys(data[0]));

        // draw the axes now that they are fully set up
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
                        // -6 is magic number to offset positions for styling/interaction to feel right
                        .attr("y", -6)
                        // need to manually set the height because the brush has
                        // no y scale, i.e. we should see the extent being marked
                        // over the full height of the overview chart
                        .attr("height", heightOverview + 7);  // +7 is magic number for styling
	}

    // by habit, cleaning/parsing the data and return a new object to ensure/clarify data object structure
    function parse(d) {
    	d.date = new Date(d.date);
        // var value = { date: parseDate(d.date) }; // turn the date string into a date object

        // // adding calculated data to each count in preparation for stacking
        // var y0 = 0; // keeps track of where the "previous" value "ended"
        // value.counts = ["count", "count2", "count3"].map(function(name) {
        //     return { name: name,
        //              y0: y0,
        //              // add this count on to the previous "end" to create a range, and update the "previous end" for the next iteration
        //              y1: y0 += +d[name]
        //            };
        // });
        // // quick way to get the total from the previous calculations
        // value.total = value.counts[value.counts.length - 1].y1;
        return d;
    }

    
    function brushed() {
    	debugger;
    	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
		
		var s = d3.event.selection || xOverview.range();

		x.domain(s.map(xOverview.invert, xOverview));
        
        // update the main chart's x axis data range
        x.domain(brush.empty() ? xOverview.domain() : brush.extent());
        // redraw the bars on the main chart
        main.selectAll(".bar.stack")
                .attr("transform", function(d) { return "translate(" + x(d.date) + ",0)"; })
        // redraw the x axis of the main chart
        main.select(".x.axis").call(xAxis);
    }

	return {
		render: render
	}
}