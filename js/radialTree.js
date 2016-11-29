var radialTreePlot = function() {
    var line = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .curve(d3.curveLinear);
    
    var margin = {top: 20, right: 120, bottom: 20, left: 120},
        width = 960 - margin.right - margin.left,
        height = 500 - margin.top - margin.bottom,
        radius = 250;

    var svg, tree,
        i = 0,
        duration = 0,
        root;
     var treeData = {
            "name": "Top Level",
            "parent": "null",
            "children": [
                {
                    "name": "Level 2: A",
                    "parent": "Top Level",
                    "children": [
                        {
                            "name": "Son of A",
                            "parent": "Level 2: A"
                        },
                        {
                            "name": "Daughter of A",
                            "parent": "Level 2: A"
                        }
                    ]
                },
                {
                    "name": "Level 2: B",
                    "parent": "Top Level"
                }
            ]
        };

    function diagonal(d) {
        return "M" + d.source.y + "," + d.source.x
            + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
            + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
            + " " + d.target.y + "," + d.target.x;
    }

    var stratify = d3.stratify()
        .parentId(function(d) { return d.substring(0, d.lastIndexOf(".")); });

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
      }
    };

    function normalizeData(data) {
        console.log(data);
        var tree = []
        var teste1 = data[0];

        var reversedGens = teste1.gens.reverse();

        //TODO: transpose and reduce
        reversedGens.forEach(function(gen, genIndex) {
            
            gen.forEach( function(indiv, indivIndex) {
                
                if (genIndex > 0) {
                    var prevGen = reversedGens[genIndex-1];
                    var prevIndiv = prevGen[indivIndex];
                    
                    if (prevIndiv.config === indiv.config || prevIndiv.fitness === indiv.fitness) {
                        return; 
                    }
                }

                if (!tree[indivIndex]) {
                    tree[indivIndex] = '';
                }

                // if (tree.indexOf(tree[indivIndex] + indiv.config) === -1 && tree[indivIndex]) {
                //     tree.push(tree[indivIndex] + indiv.config);
                // }
                
                tree[indivIndex] += indiv.config + '.';
            });


        });

        tree = tree.map(function(path) {
            var shouldRemove = R.compose(R.equals(R.length(path) - 1), R.lastIndexOf('.'));
            if(shouldRemove(path)) {
                path = R.dropLast(1, path);
            }
            return {
                path: path
            };
        });

        console.log(tree);
        
        tree.forEach(function(row) {
            row.taxonomy = row.path.split(".");
        });

        // var root = d3.hierarchy(burrow(tree));
        // console.log(root);
        treeData = burrow(tree);
    }

    function init () {

        svg = d3.select('#main')
            .append('svg')
            .attr("id", '#radial-tree')
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");


        // tree = d3.cluster()
        //     .size([height, width]);

        var tree = d3.tree()
            .size([height, radius - 90])
            .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });


        root = d3.hierarchy(treeData);
        // root.x0 = height / 2;
        // root.y0 = 0;
        // render(root);
        tree(root);

          var link = svg.selectAll(".link")
              .data(root.descendants().slice(1))
            .enter().append("path")
              .attr("class", "link")
              .attr("d", function(d) {
                return "M" + project(d.x, d.y)
                    + "C" + project(d.x, (d.y + d.parent.y) / 2)
                    + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
                    + " " + project(d.parent.x, d.parent.y);
              });

          var node = svg.selectAll(".node")
              .data(root.descendants())
            .enter().append("g")
              .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
              .attr("transform", function(d) { return "translate(" + project(d.x, d.y) + ")"; });

          node.append("circle")
              .attr("r", 2.5);

          node.append("text")
              .attr("dy", ".31em")
              .attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -6; })
              .style("text-anchor", function(d) { return d.x < 180 === !d.children ? "start" : "end"; })
              .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
              .text(function(d) { return d.data.name; });

        d3.select(self.frameElement).style("height", height + margin.top + margin.bottom + "px");
    }

    function remove() {
        svg.remove();
    }

    function render (source) {
        // Compute the new tree layout.
        var nodes = source.descendants(),
            links = source.links();

        tree(source);

        // Normalize for fixed-depth.
        nodes.forEach(function(d) { d.y = d.depth * 180; });

        // Update the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("class", function(d) {
                return "node" + (d.children ? " node--internal" : " node--leaf");
            })
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
            .on("click", click);

        nodeEnter.append("circle")
            .attr("r", 5)
            .style("fill", function(d) { return d.children ? "lightsteelblue" : "#fff"; });

        nodeEnter.append("text")
            .attr("x", function(d) { return d.children ? -13 : 13; })
            .attr("dy", ".35em")
            .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
            .text(function(d) { return d.data.name; })
            .style("fill-opacity", 1);

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

        nodeUpdate.select("circle")
            .attr("r", 5)
            .style("fill", function(d) { return d.children ? "lightsteelblue" : "#fff"; });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        // Update the links…
        var link = svg.selectAll("path.link")
            .data(links, function(d) { return d.target.id; });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
//                    var o = {x: source.x0, y: source.y0};
//                    return diagonal({source: o, target: o});
                return diagonal(d);
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
//                    return diagonal(d);
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });


        var link = svg.selectAll(".link")
            .data(links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", diagonal);

        var node = svg.selectAll(".node")
            .data(nodes)
            .enter().append("g")
            .attr("class", function(d) {
                return "node" + (d.children ? " node--internal" : " node--leaf");
            })
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

        node.append("circle")
            .attr("r", 2.5);

        node.append("text")
            .attr("dy", 3)
            .attr("x", function(d) { return d.children ? -8 : 8; })
            .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
            .text(function(d) { return d.data.name; });
    }
    function project(x, y) {
      var angle = (x - 90) / 180 * Math.PI, radius = y;
      return [radius * Math.cos(angle), radius * Math.sin(angle)];
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
        init: init,
        remove: remove,
        normalizeData: normalizeData,
        render: render
    }
}();