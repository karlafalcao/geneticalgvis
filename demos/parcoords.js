var data = [{
  "Plant": "American Blueberry",
  "Chemical": "Calcium Ion",
  "Pathway": "neuron projection development",
  "Gene": "ADCYAP1",
  "Disease": "Alzheimer's Disease"
}, {
  "Plant": "American Blueberry",
  "Chemical": "Calcium Ion",
  "Pathway": "neuron projection development",
  "Gene": "MAPK14",
  "Disease": "Alzheimer's Disease"
}, {
  "Plant": "American Blueberry",
  "Chemical": "Calcium Ion",
  "Pathway": "positive regulation of gene expression",
  "Gene": "ADCYAP1",
  "Disease": "Alzheimer's Disease"
}, {
  "Plant": "American Blueberry",
  "Chemical": "Calcium Ion",
  "Pathway": "positive regulation of gene expression",
  "Gene": "MAPK14",
  "Disease": "Alzheimer's Disease"
}, {
  "Plant": "American Blueberry",
  "Chemical": "Calcium Ion",
  "Pathway": "intracellular signal transduction",
  "Gene": "ADCYAP1",
  "Disease": "Alzheimer's Disease"
}, {
  "Plant": "American Blueberry",
  "Chemical": "Calcium Ion",
  "Pathway": "intracellular signal transduction",
  "Gene": "MAPK14",
  "Disease": "Alzheimer's Disease"
}];


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

var svg = d3.select("body").append("svg:svg")
  .attr("width", w + m[1] + m[3])
  .attr("height", h + m[0] + m[2])
  .append("svg:g")
  .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

// Extract the list of dimensions and create a scale for each.
x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
  if (d === "name") return false;
  if (d === "Plant" || d === "Chemical" || d === "Pathway" || d === "Gene" || d === "Disease") {
    y[d] = d3.scalePoint().domain(data.map(function(p) {
      return p[d];
    })).range([h, 0]);
  } else {
    y[d] = d3.scaleLinear()
      .domain(d3.extent(data, function(p) {
        return +p[d];
      }))
      .range([h, 0]);
  }
  return true;
}));

// Add grey background lines for context.
background = svg.append("svg:g")
  .attr("class", "background")
  .selectAll("path")
  .data(data)
  .enter().append("svg:path")
  .attr("d", path);

// Add blue foreground lines for focus.
foreground = svg.append("svg:g")
  .attr("class", "foreground")
  .selectAll("path")
  .data(data)
  .enter().append("svg:path")
  .attr("d", path);

// Add a group element for each dimension.
var g = svg.selectAll(".dimension")
  .data(dimensions)
  .enter().append("svg:g")
  .attr("class", "dimension")
  .attr("transform", function(d) {
    return "translate(" + x(d) + ")";
  });

// Add an axis and title.
g.append("svg:g")
  .attr("class", "axis")
  .each(function(d) {
    d3.select(this).call(d3.axisRight(y[d]));
  })
  .append("svg:text")
  .attr("text-anchor", "middle")
  .attr("y", -9)
  .text(String);

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
