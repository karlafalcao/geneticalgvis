var radialTreePlot = function(svgContainerId) {
    var line = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .curve(d3.curveLinear);
    
    var margin = {top: 20, right: 120, bottom: 20, left: 120},
        width = 960 - margin.right - margin.left,
        height = 500 - margin.top - margin.bottom,
        radius = 550;

    var i = 0,
        duration = 0,
        root;

    var svg = d3.select('#main')
        .append('svg')
        .attr("id", svgContainerId)
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

    var tree = d3.tree()
        .size([height, radius - 50])
        .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

    function diagonalRadial(d) {
        return "M" + project(d.source.x, d.source.y)
            + "C" + project(d.source.x, (d.source.y + d.target.y) / 2)
            + " " + project(d.target.x, (d.source.y + d.target.y) / 2)
            + " " + project(d.target.x, d.target.y);
    }

    function render (root) {
        console.log(root)
        tree(root);

        var link = svg.selectAll(".link")
            .data(root.links())
            .enter().append("path")
            .attr("class", "link")
            .attr("d", diagonalRadial);

        var node = svg.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
            .attr("transform", function(d) { return "translate(" + project(d.x, d.y) + ")"; });

        node.append("circle")
            .attr("r", 2);

       //
       node.append("text")
          .attr("dy", ".31em")
          .attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -6; })
          .style("text-anchor", function(d) { return d.x < 180 === !d.children ? "start" : "end"; })
          .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
          .text(function(d) { return d.data.name === 'root' ? d.data.name : ''; });

        d3.select(self.frameElement).style("height", height + margin.top + margin.bottom + "px");
    }

    function project(x, y) {
      var angle = (x - 90) / 180 * Math.PI, radius = y;
      return [radius * Math.cos(angle), radius * Math.sin(angle)];
    }

    return {
        render: render
    }
};