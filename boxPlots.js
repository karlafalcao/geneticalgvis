var algenBoxPlots = function () {
    var svg;
    var margin = {top: 20, right: 80, bottom: 30, left: 50};

    //Width and height
    var width = 1000 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    //Update scale domains
    var barWidth = 40;
    var padding = 0;
    var xScale;
    var yScale;

    var xAxisScale,
        yAxisScale;

    var dateBarColor = '#ccc';
    var dataset;

    function renderBoxPlots() {
        //Create SVG element
        var svgContainer = d3.select('body')
            .append('svg')
            .attr('id', '#boxplots')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        svg = svgContainer.append('g')
            .attr('width', width)
            .attr('height', height)
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        svg
            .append('g')
            .attr('id', 'time-axis-x');

        svg
            .append('g')
            .attr('id', 'time-axis-y');

    }

    function updateBoxPlots() {
        //scales
        xScale = d3.scaleBand().rangeRound([0, width]).padding(0);
        xScale.domain(d3.range(dataset.length));
        barWidth = xScale.bandwidth() - 10;
        padding = barWidth / 2;

        yScale = d3.scaleLinear().range([0, height]);
        yScale.domain([0, d3.max(dataset, function (d) {
            return d.value;
        })]);

        xAxisScale = d3.scaleLinear().range([padding, width + padding]);
        xAxisScale.domain([1, dataset.length]);

        yAxisScale = d3.scaleLinear().range([height, 0]);
        yAxisScale.domain([0, d3.max(dataset, function (d) {
            return d.value;
        })]);

        //x-axis
        var xAxis = d3.axisBottom(xAxisScale);

        var xAxisElem = svg
            .select('#time-axis-x')
            .call(xAxis)
            .attr('transform', 'translate(0,' + height + ')')


        xAxisElem.append('line')
            .attrs(function (d) {
                return {
                    x1: width + padding,
                    x2: width + 2 * padding,
                    y1: .5,
                    y2: .5,
                    stroke: '#000'
                }
            });

        xAxisElem.append('line')
            .attrs(function (d) {
                return {
                    x1: 0,
                    x2: barWidth / 2,
                    y1: .5,
                    y2: .5,
                    stroke: '#000'
                }
            });

        xAxisElem.append('text')
            .text('Teste#')
            .attrs({
                x: width + 60,
                y: -20,
                dy: '0.71em',
                fill: '#000'
            });

        //y-axis
        svg
            .select('#time-axis-y')
            .call(d3.axisLeft(yAxisScale))
            .append('text')
            .attrs({
                transform: 'rotate(-90)',
                y: 6,
                dy: '0.71em',
                fill: '#000'
            })
            .text('Variancias das iterações');

        //graphs
        var boxPlotGroup = svg.selectAll('g')
            .data(dataset, key);

        var appGroup = boxPlotGroup
            .enter().append('g');

        //middle line
        appGroup.append('line')
            .attrs(function (d) {
                return {
                    x1: xAxisScale(d.id),
                    x2: xAxisScale(d.id),
                    y1: height - yScale(d.max),
                    y2: height - yScale(d.min),
                    stroke: '#000'
                }
            });

        //Select...
        var bar = appGroup.append('rect');
        //Update...
        setRectStyle(bar);
        //Min marker
        appGroup.append('line')
            .attrs(function (d) {
                return {
                    x1: xAxisScale(d.id) - barWidth / 2,
                    x2: xAxisScale(d.id) + barWidth / 2,
                    y1: height - yScale(d.min),
                    y2: height - yScale(d.min),
                    stroke: '#000'
                }
            });
        //Max marker
        appGroup.append('line')
            .attrs(function (d) {
                return {
                    x1: xAxisScale(d.id) - barWidth / 2,
                    x2: xAxisScale(d.id) + barWidth / 2,
                    y1: height - yScale(d.max),
                    y2: height - yScale(d.max),
                    stroke: '#000'
                }
            });

        //Median marker
        appGroup.append('line')
            .attrs(function (d) {
                return {
                    x1: xAxisScale(d.id) - barWidth / 2,
                    x2: xAxisScale(d.id) + barWidth / 2,
                    y1: height - yScale(d.median),
                    y2: height - yScale(d.median),
                    stroke: '#000'
                }
            });
    }

    //Define key function, to be used when binding data
    var key = function (d) {
        return d ? d.key : this.id;
    };

    function getColorForDateBar() {
        return dateBarColor;
    }

    function normalizeData (data) {
        dataset = data.map(function(item, i) {
            var variances = item.variances;

            variances.sort(function(){return arguments[0] - arguments[1]});
            var boxPlotValues = getBoxPlotValues(variances);

            var mapValue = Object.assign({}, {
                key: i,
                id: i+1,
                value: boxPlotValues.max,
                values: variances
            }, boxPlotValues);

            console.log(mapValue);
            return mapValue;
        });
    }

    function getBoxPlotValues(data) {
        //consider data already sorted
        var median = d3.median(data);

        var lowerHalf = [], upperHalf = [];

        data.forEach(function(item){
            if (item < median) {
                lowerHalf.push(item);
            } else if (item > median) {
                upperHalf.push(item);
            }
        });

        return {
            median: median,

            q1: d3.median(lowerHalf),
            q3: d3.median(upperHalf),

            min: data[0],
            max: data[data.length-1]
        }
    }

    var setRectStyle = function (sel) {
        sel.attr('class', 'timebar')
            .attr('x', function (d, i) {
                return xAxisScale(d.id) - barWidth / 2;
            })
            .attr('y', function (d) {
                //thirdQuartile
                return height - yScale(d.q3);
            })
            .attr('width', barWidth)
            .attr('height', function (d) {
                //firstQuartile
                return yScale(d.q3) - yScale(d.q1);
            })
            .attr('fill', function (d) {
                return getColorForDateBar(d.id);
            });
    };

    return {
        normalizeData: normalizeData,
        render: renderBoxPlots,
        update: updateBoxPlots
    };
}();