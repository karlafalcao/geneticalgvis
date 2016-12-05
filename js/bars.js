var barsPlot = function (svgContainerId) {

    var svg = d3.select("#main")
        .append('svg')
        .attr('id', svgContainerId)
        .attr("width", 960)
        .attr("height", 500);

    var margin = {top: 20, right: 120, bottom: 110, left: 40},
        margin2 = {top: 430, right: 120, bottom: 30, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        height2 = +svg.attr("height") - margin2.top - margin2.bottom; //40px

    var parseDate = d3.timeParse("%d/%m/%Y");

    var colour = d3.scaleOrdinal()
                .range([
                    '#993404',
                    '#d95f0e',
                    '#fe9929',
                    '#fed98e'
                ]);

    var counts = [
        "< 0.25",
        ">= 0.25 e < 0.50",
        ">= 0.50 e < 1",
        "== 1",
    ];

    var x = d3.scaleLinear().range([0, width]),
        x2 = d3.scaleLinear().range([0, width]),
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

    function normalizeData(data) {
        var teste1 = data[0];

        var allGens = data.reduce(function(prev, cur, sampleIndex) {
            var testLabel = 'Test' + (sampleIndex+1);

            var gensData = cur.gens.map(function(gen, genIndex) {

                var genLabel = 'Gen' + genIndex;

                var value = {
                    name: testLabel + genLabel,
                    total: 20
                }

                var freq = {
                    count1: gen.filter(function(indiv){ return indiv.fitness < 0.25; }).length,
                    count2: gen.filter(function(indiv){ return indiv.fitness >= 0.25 && indiv.fitness < 0.50; }).length,
                    count3: gen.filter(function(indiv){ return indiv.fitness >= 0.50 && indiv.fitness < 1; }).length,
                    count4: gen.filter(function(indiv){ return indiv.fitness === 1;}).length,
                };

                var y0 = 0;
                
                value.counts = Object.keys(freq).map(function(name) {
                    return { 
                        name: name,
                        y0: y0,
                        y1: y0 += +freq[name]
                    };
                });

                return value;
            });

            return prev.concat(gensData);
        }, []);
        
        console.log(allGens);
        return allGens;
    }

    var render = function(data) {
        x.domain([0, data.length - 1]);
        y.domain([0, d3.max(data, function(d) { return d.total; })]);
        x2.domain(x.domain());
        y2.domain(y.domain());
        colour.domain(counts);
        
        // draw the bars
        focus.append("g")
            .attr("class", "bars")
            .attr('clip-path', 'url(#clip)')
            .selectAll(".bar.stack")
            .data(data)
        .enter()
        .append("g")
        .attr("class", "bar stack")
        .attr("transform", function(d, i) { return "translate(" + x(i) + ",0)"; })
            .selectAll("rect")
            .data(function(d) { return d.counts; })
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("width", 10)
        .attr("y", function(d) { return y(d.y1); })
        .attr("height", function(d) { return y(d.y0) - y(d.y1); })
        .style("fill", function(d) { return colour(d.name); });


        var xAxisElem = focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis.tickValues([0,250,500,750,1000,1250,1500,1750,2000,2250])
	            	.tickFormat(function (d,i){
	            		return ["Teste "+(i+1)];
	            	}));

        xAxisElem.append('text')
            .text('Gerações')
            .attrs({
                x: width/2,
                y: 30,
                'font-size': '1em',
                fill: '#000'
            });

        var yAxisElem = focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        yAxisElem
            .append('text')
            .attrs({
                transform: 'translate(-30, ' + ((height/2) - 50) +') rotate(-90)',
                y: 6,
                'font-size' : '1em',
                fill: '#000'
            })
            .text('Indivíduos');

        // draw overview bars
        context.append("g")
            .attr("class", "bars")
            .attr('clip-path', 'url(#clip)')
            .selectAll(".bar")
            .data(data)
        .enter()
        .append("g")
        .attr("class", "bar stack")
        .attr("transform", function(d, i) { return "translate(" + x2(i) + ",0)"; })
            .selectAll("rect")
            .data(function(d) { return d.counts; })
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("width", 10)
        .attr("y", function(d) { return y2(d.y1); })
        .attr("height", function(d) { return y2(d.y0) - y2(d.y1); })
        .style("fill", function(d) { return colour(d.name); });

        // .append("rect")
        // .attr("class", "bar")
        // .attr("x", function(d, i) { return x2(i) - 3; })
        // .attr("width", 6)
        // .attr("y", function(d) { return y2(d.total); })
        // .attr("height", function(d) { return height2 - y2(d.total); })

        context.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2.tickValues([0,250,500,750,1000,1250,1500,1750,2000,2250])
	            	.tickFormat(function (d,i){
	            		return ["Teste "+(i+1)];
	            	}));

        context.append("g")
            .attr("class", "brush")
            .call(brush);

        showColorLabels();
    };

    function brushed() {
        var s = d3.event.selection || x2.range();
        x.domain(s.map(x2.invert, x2));
        console.log(d3.event.selection);
        focus
            .selectAll(".bar.stack")
            .attr("transform", function(d, i) { return "translate(" + x(i) + ",0)"; })

        if (d3.event.selection == null){
	        focus
	            .select(".axis--x")
	            .call(xAxis
	            	.tickValues([0,250,500,750,1000,1250,1500,1750,2000,2250])
	            	.tickFormat(function (d,i){
	            		return ["Teste "+(i+1)];
	            	}));
        } else {
        	focus
	            .select(".axis--x")
	            .call(xAxis.tickValues(null)
                    .tickFormat(function (d,i){
                        if (d==0){
                            return ("Teste 1");
                        }else if (d%250 == 0){
                            return ["Teste "+((d/250)+1)];
                        } else { 
                            return ["Gen "+d%250];
                        }
                        
                    }));
        }
    }

    function showColorLabels() {

        labels = svg.append('g')
            .attr('class', 'labels')
            .attr('transform', 'translate('+ (width + margin.left + 10) + ' , 0)');

        labels
            .append('text')
            .text('Intervalo de fitness por cores')
            .attrs({
                x: 0,
                y: 0,
                'font-size': '11px',
                'font-weight': 'bold',
                'transform': 'translate(0, -5)'
            });

        var labelsGroup = labels.selectAll('g')
            .data(counts);

        // Enter...
        var labelsGroupAdd = labelsGroup
            .enter()
            .append('g')
            .attr('class', 'line-group');

        // Update
        var labelsGroupUpdate = labelsGroup
            .transition()
            .duration(500);

        labelsGroup
            .exit()
            .remove();
        
        labelsGroupAdd
            .append('rect')
            .attr('height', 10)
            .attr('width', 10)
            .attr('y', function (d, i) {
                return i * 17;
            })
            .attr('fill', function (d, i) {
                return colour('count'+(i+1));
            });

        labelsGroupAdd
            .append('text')
            .text(function (d, i) {
                return d;
            })
            .attrs({
                x: 12,
                y: function (d, i) {
                    return (i + 1) * 16;
                },
                'font-size': '11px',
                'transform': 'translate(0, -5)'
            });

        // labelsGroupUpdate
        //     .select('rect')
        //     .attr('height', 10)
        //     .attr('width', 10)
        //     .attr('y', function (d, i) {
        //         return i * 17;
        //     })
        //     .attr('fill', function (d, i) {
        //         return colour('count'+(i+1));
        //     });

        // labelsGroupUpdate
        //     .select('text')
        //     .text(function (d, i) {
        //         return d;
        //     })
        //     .attr('y', function (d, i) {
        //         return (i + 1) * 17;
        //     })
        //     .attr('x', 12)
        //     .attrs({
        //         'transform': 'translate(0, -5)'
        //     });
    }

    return {
        normalizeData: normalizeData,
        render: render
    }
}