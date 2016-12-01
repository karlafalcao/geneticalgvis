var treePlot = function(svgContainerId) {
    var line = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .curve(d3.curveLinear);
    
    var margin = {top: 20, right: 120, bottom: 20, left: 120},
        width = 1920 - margin.right - margin.left,
        height = 500 - margin.top - margin.bottom;

    var i = 0,
        duration = 0,
        root;

    var svg = d3.select('#main')
        .append('svg')
        .attr("id", svgContainerId)
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tree = d3.tree()
        .size([height, width]);

    function diagonal(d) {
        return "M" + d.source.y + "," + d.source.x
            + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
            + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
            + " " + d.target.y + "," + d.target.x;
    }

    var burrow = function(table) {
        // create nested object
        var obj = {};
        table.forEach(function(row) {
        // start at root
        var layer = obj;

        // create children as nested objects
        row.taxonomy.forEach(function(key) {
            layer[key] = key in layer ? layer[key] : {};
            layer = layer[key];
        });
      });

        // recursively create children array
        var descend = function(obj, depth) {
            var arr = [];
            var depth = depth || 0;
            for (var k in obj) {

            var child = {
                    name: k,
                    depth: depth,
                    children: descend(obj[k], depth+1)
                };
                arr.push(child);
            }
            return arr;
        };

          // use descend to create nested children arrys
        return {
            name: "root",
            children: descend(obj, 1),
            depth: 0
        };

    };

    function generateTreeData(data) {
        var treeData = [];
        var reversedGens = data.reverse();

        //TODO: transpose and reduce
        reversedGens.forEach(function(gen, genIndex) {

            gen.forEach( function(indiv, indivIndex) {

                if (genIndex > 0) {
                    var prevGen = reversedGens[genIndex-1];
                    var prevIndiv = prevGen[indivIndex];

                    if (prevIndiv.fitness === indiv.fitness) {
                        return;
                    }
                }

                if (!treeData[indivIndex]) {
                    treeData[indivIndex] = {};
                    treeData[indivIndex].taxonomy = []
                }

                treeData[indivIndex].taxonomy.push(indiv.config);
            });

        });

        return treeData;
    }

    function normalizeData(data) {
        var teste1 = data[0];

        //var allTests = data.reduce(function(prev, curr) {
        //    return prev.concat(curr.gens);
        //}, []);

        var treeData = generateTreeData(teste1.gens);

        root = d3.hierarchy(burrow(treeData));
        root.x0 = height / 2;
        root.y0 = 0;

        return root;
    }

    function render (root) {
        console.log(root);
        // Compute the new tree layout.
        tree(root);
        var nodes = root.descendants(),
            links = root.links();

        // Normalize for fixed-depth.
        nodes.forEach(function(d) { d.y = d.depth * 120; });

        // Update the nodes...
        var node = svg
            .selectAll("g.node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("class", function(d) {
                return "node" + (d.children ? " node--internal" : " node--leaf");
            })
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
            .on("click", click);

        nodeEnter
            .append("circle")
            .attr("r", 5)
            .style("fill", function(d) { return d.children ? "lightsteelblue" : "#fff"; });

        nodeEnter
            .append("text")
            .attr("x", function(d) { return d.children ? -8 : 8; })
            .attr("dy", ".35em")
            .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
            .text(function(d) { return d.data.name; })
            .style("fill-opacity", 1);

        // Update
        var nodeUpdate = node
            .transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

        nodeUpdate.select("circle")
            .attr("r", 5)
            .style("fill", function(d) { return d.children ? "lightsteelblue" : "#fff"; });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        //Exit
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + root.y + "," + root.x + ")"; })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        var link = svg
            .selectAll("path.link")
            .data(links, function(d) { return d.target.id; });

        // Enter
        link
            .enter()
            .insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                   // var o = {x: root.x0, y: root.y0};
                   // return diagonal({source: o, target: o});
                return diagonal(d);
            });

        // Update
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Exit
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                // var o = {x: root.x, y: root.y};
                // return diagonal({source: o, target: o});
                return diagonal(d);
            })
            .remove();

        nodes.forEach(function(d) {
             d.x0 = d.x;
             d.y0 = d.y;
        });

        d3.select(self.frameElement).style("height", height + margin.top + margin.bottom + "px");
        d3.select(self.frameElement).style("width", width + margin.top + margin.bottom + "px");
    }

    // Toggle children on click.
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        render(root);
    }

    return {
        normalizeData: normalizeData,
        render: render
    }
};