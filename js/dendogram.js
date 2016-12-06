var dendogramPlot = function(viewsContainer, svgContainerId) {
  var timeout;
  var outerRadius = 780 / 2,
      innerRadius = outerRadius - 170;

  var color = d3.scaleOrdinal()
      .range([
          "#a6cee3",
          "#1a1a1a",
          "#b2df8a",
          "#33a02c",
          "#fb9a99",
          "#e31a1c",
          "#fdbf6f",
          "#ff7f00",
          "#cab2d6",
          "#66c2a5",
        ])
      .domain(Array(10).fill("Teste").map(function(d, i){ return d+i}));

  var cluster = d3.cluster()
      .size([360, innerRadius])
      .separation(function(a, b) { return 1; });

  var svg = d3.select(viewsContainer)
      .append("svg")
      .attr("id", svgContainerId)
      .attr("width", outerRadius * 2)
      .attr("height", outerRadius * 2);

  var chart = svg.append("g")
      .attr("transform", "translate(" + (outerRadius - 50) + "," + (outerRadius - 50) + ")");

  function mouseovered(active) {
    var that = this;
    return function(d) {
      d3.select(that).classed("label--active", active);
      d3.select(d.linkExtensionNode).classed("link-extension--active", active).each(moveToFront);
      do d3.select(d.linkNode).classed("link--active", active).each(moveToFront); while (d = d.parent);
    };
  }

  
  function moveToFront() {
    this.parentNode.appendChild(this);
  }
  function render(data) {
    drawLabels();

    var root = d3.hierarchy(data, function(d) { return d.branchset; });
    root
      .sum(function(d) { return 1; })
      .sort(function(a, b) { return (a.value - b.value) || d3.ascending(a.data.length, b.data.length); });

    var nodes = root.descendants(),
        links = root.links(),
        input = d3.select("#show-length input").on("change", changed);
    
    cluster(root);

    timeout = setTimeout(function() { input.property("checked", true).each(changed); }, 2000);
  
    console.log(root);
    setRadius(root, root.data.length = 0, innerRadius / maxLength(root));
    setColor(root);

    var linkExtension = chart.append("g")
        .attr("class", "link-extensions")
      .selectAll("path")
        .data(links.filter(function(d) { return !d.target.children; }))
      .enter().append("path")
        .each(function(d) { d.target.linkExtensionNode = this; })
        .attr("d", function(d) { 
          return step(d.target.x, d.target.y, d.target.x, innerRadius); 
        });

    var link = chart.append("g")
        .attr("class", "links")
      .selectAll("path")
        .data(links)
      .enter().append("path")
        .each(function(d) { d.target.linkNode = this; })
        .attr("d", function(d) { return step(d.source.x, d.source.y, d.target.x, d.target.y) })
        .style("stroke", function(d) { return d.target.color; });

    var text = chart.append("g")
        .attr("class", "labels")
      .selectAll("text")
        .data(nodes.filter(function(d) { return !d.children; }))
    .enter()
      .append("text")
      .attr('class', "label")
      .attr('fill', function(d) { return d.color; })
      .attr("dy", ".31em")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (innerRadius + 4) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
      .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .text(function(d) { 
        return d.data.name.replace(/_/g, " "); 
      })
      .on("mouseover", mouseovered(true))
      .on("mouseout", mouseovered(false));

    d3.select(self.frameElement).style("height", outerRadius * 2 + "px");
    
    function changed() {
      clearTimeout(timeout);
      var checked = this.checked;
      d3.transition().duration(750).each(function() {
        linkExtension.transition().attr("d", function(d) { return step(d.target.x, checked ? d.target.radius : d.target.y, d.target.x, innerRadius); });
        link.transition().attr("d", function(d) { return step(d.source.x, checked ? d.source.radius : d.source.y, d.target.x, checked ? d.target.radius : d.target.y) });
      });
    } 
  };

  // Compute the maximum cumulative length of any node in the tree.
  function maxLength(d) {
    return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
  }

  // Set the radius of each node by recursively summing and scaling the distance from the root.
  function setRadius(d, y0, k) {
    d.radius = (y0 += d.data.length) * k;
    if (d.children) d.children.forEach(function(d) { setRadius(d, y0, k); });
  }

  // Set the color of each node by recursively inheriting.
  function setColor(d) {
    d.color = color.domain().indexOf(d.data.name) >= 0 ? color(d.data.name) : d.parent ? d.parent.color : null;
    if (d.children) d.children.forEach(setColor);
  }

  // Like d3.svg.diagonal.radial, but with square corners.
  function step(startAngle, startRadius, endAngle, endRadius) {
    var c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI),
        s0 = Math.sin(startAngle),
        c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI),
        s1 = Math.sin(endAngle);
    return "M" + startRadius * c0 + "," + startRadius * s0
        + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
        + "L" + endRadius * c1 + "," + endRadius * s1;
  }

  function drawLabels() {
    svg.append('label')
      .attr("id", "show-length")
      .append("input")
      .attr("type", "checkbox")
      .text("Show branch length");

    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(0,0)")
      .selectAll("g")
        .data(color.domain())
      .enter().append("g")
        .attr("transform", function(d, i) { return "translate(" + 0 + "," + (i * 20 + 10) + ")"; });

    legend.append("rect")
        .attr("x", 15)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", color);

    legend.append("text")
        .attr("x", 70)
        .attr("y", 10)
        .attr("font-size", "12px")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

  }

  
  return {
    render: render
  }
}