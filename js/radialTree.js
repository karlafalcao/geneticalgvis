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
        .size([height, radius - 90])
        .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

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
        var tree = [];
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

        root = d3.hierarchy(burrow(tree));
        root.x0 = height / 2;
        root.y0 = 0;
        return root;
    }

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
       //node.append("text")
       //    .attr("dy", ".31em")
       //    .attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -6; })
       //    .style("text-anchor", function(d) { return d.x < 180 === !d.children ? "start" : "end"; })
       //    .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
       //    .text(function(d) { return d.data.name === 'root' ? d.data.name : ''; });

        d3.select(self.frameElement).style("height", height + margin.top + margin.bottom + "px");
    }

    function project(x, y) {
      var angle = (x - 90) / 180 * Math.PI, radius = y;
      return [radius * Math.cos(angle), radius * Math.sin(angle)];
    }

    return {
        render: render,
        normalizeData: normalizeData
    }
};