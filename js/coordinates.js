var coordinatesPlot = function (viewsContainer, svgContainerId) {
  var m = [30, 10, 10, 10],
    w = 1000 - m[1] - m[3],
    h = 300 - m[0] - m[2];

  var x = d3.scaleBand().range([0, w]);
  var y = {};
  var dragging = {};

  var line = d3.line();
  var axis = d3.axisLeft();
  var background;
  var foreground;

  var svg = d3.select(viewsContainer)
    .append("svg:svg")
    .attr('id', svgContainerId)
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
    .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
  

  function brushed (d){

    var brushes = d3.selectAll('.parallel-brush')._groups[0];
    var actives = dimensions.filter(function(p, i) { 
      console.log(y[p].range());
      return d3.brushSelection( brushes[i]) !== null;
    }),
    extents = actives.map(function(p, i) { 
      s = d3.event.selection || d3.brushSelection( brushes[i])
      return s.map(y[p].invert, y[p]) 
    });
    
    foreground.style("display", function(d) {

      return (actives.every(function(p, activeIndex) {
        return extents[activeIndex][0] <= d[p] && y[p] <= extents[activeIndex][1];
        // return false;
      }) ? null : 'none');
    });
  }
  function brushstart() {
    d3.event.sourceEvent.stopPropagation();
  }
    var brush = d3.brushY()
        .extent([[0, 0], [20, h]])
        .on("end", brushed)
        .on("start", brushstart);

  function render(data) {

    var info = data.map(function(d, i){
      if (i > 9){
        d.info.name = 'Alg 2 teste'+(i-9);  
      } else {
        d.info.name = 'Alg 1 teste'+(i+1);
      }
      delete d.info.populacao;
      return d.info;
    });

    // Extract the list of dimensions and create a scale for each.
    dimensions = d3.keys(info[0]).filter(function(d) {
      
      if (d === "name") {
        y[d] = d3.scalePoint().domain(info.map(function(p) {
          return p[d];
        })).range([h, 0]);
      } else {
        y[d] = d3.scaleLinear()
          .domain(d3.extent(info, function(p) {
            return +p[d];
          }))
          .range([h, 0]);
      }
      return true;
    });
    var names = dimensions.pop();
    dimensions.splice(0, 0, names);

    x.domain(dimensions);

    // Add grey background lines for context.
    background = svg.append("svg:g")
      .attr("class", "background")
      .selectAll("path")
      .data(info)
      .enter().append("svg:path")
      .attr("d", path);

    // Add blue foreground lines for focus.
    foreground = svg.append("svg:g")
      .attr("class", "foreground")
      .selectAll("path")
      .data(info)
      .enter().append("svg:path")
      .attr("d", path)
      .attr("stroke", function(d, i){
          if (i < 10){
            return 'steelblue';
          } else {
            return 'red';
          }
      });

    // Add a group element for each dimension.
    var g = svg.selectAll(".dimension")
      .data(dimensions)
      .enter().append("svg:g")
      .attr("class", "dimension")
      .attr("transform", function(d) {
        return "translate(" + x(d) + ")";
      });

    // Add an axis and title.
    var axisgroup = g.append("svg:g")
      .attr("class", "parallel-axis")
      .each(function(d) {
        d3.select(this).call(d3.axisRight(y[d]));
      });

      axisgroup.append("svg:text")
      .attr("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d){
        console.log(d);
        return String(d);
      })
      
      axisgroup.append("g")
            .attr("class", "parallel-brush")
            .call(brush);
  }
  function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
  }

  function transition(g) {
    return g.transition().duration(500);
  }

  // Returns the path for a given data point.
  function path(d) {
    return line(dimensions.map(function(p) {
      return [position(p), y[p](d[p])];
    }));
  }

  return {
    render: render
  }
}