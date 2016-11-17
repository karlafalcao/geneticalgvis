var pcaPlots = function () {
    var margin = {top: 20, right: 20, bottom: 20, left: 30};
    var width = 500 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    var angle = Math.PI * 0;
    
    var color = d3.scaleOrdinal()
        .range(d3.schemeCategory10
        .map(function(c) { c = d3.rgb(c); c.opacity = 0.6; return c; }));

    var x = d3.scaleLinear().range([width, 0]); // switch to match how R biplot shows it
    var y = d3.scaleLinear().range([height, 0]);

    x.domain([-5.5,5.5]).nice();
    y.domain([-5.5,5.5]).nice();
    
    // normally we don't want to see the axis in PCA, it's meaningless
    var showAxis = true;

    var dataset;
    var testes;

    function renderPcaPlots() {
        //Create SVG element
        var svgContainer = d3.select('body')
            .append('svg')
            .attr('id', '#pca-plots')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        svg = svgContainer.append('g')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        if (showAxis) {
            var xAxis = d3.axisBottom(x);

            var yAxis = d3.axisLeft(y);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .append("text")
                    .attr("class", "label")
                    .attr("x", width)
                    .attr("y", -6)
                    .style("text-anchor", "end")
                    .text("PC1");

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                    .attr("class", "label")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("PC2");
        }

    }

    function updatePcaPlots() {

		//
        svg.selectAll("circle.dot-component")
            .data(dataset)
            .enter().append("circle")
            .attr("class", "dot-component")
            .attr("r", 7)
            .attr("cx", function(d) { return x(d.pc1); })
            .attr("cy", function(d) { return y(d.pc2); })
            .style("fill", function(d) { return color(d.id); });

        svg.selectAll("text.label-component")
            .data(dataset)
            .enter().append("text")
            .attr("class", "label-component")
            .attr("x", function(d) { return x(d.pc1) + 10; })
            .attr("y", function(d) { return y(d.pc2) + 0; })
            .text(function(d) { return d.id});


        svg.selectAll(".line-component")
            .data(dataset)
            .enter().append("line")
            .attr("class", "line-component")
            .attr('x1', function(d) { return x(-d.pc1);})
            .attr('y1', function(d) { return y(-d.pc2); })
            .attr("x2", function(d) { return x(d.pc1); })
            .attr("y2", function(d) { return y(d.pc2); })
            .style("stroke", function(d) { return color(d.id); });

        //
        //svg.selectAll(".sample-dot")
        //    .data(testes)
        //    .enter().append("circle")
        //    .attr("class", "sample-dot")
        //    .attr("r", 3.5)
        //    .attr("stroke", "black")
        //    .attr("cx", function(d) { return x(d.pc1); })
        //    .attr("cy", function(d) { return y(d.pc2); })
        //    .style("fill", function(d) { console.log(d); return '#000'; });
		//
        //svg.selectAll("text.label-sample")
        //    .data(testes)
        //    .enter().append("text")
        //    .attr("class", "label-sample")
        //    .attr("x", function(d,i ) { return x(d.pc1) + 4 ; })
        //    .attr("y", function(d ,i) { return y(d.pc2); })
        //    .text(function(d,i) { return d.id})
    }

    /*
    * Using singular value decomposition (SVD)
    * */
    function getPCFromSVD(dataset) {
        //create matrix
        var matrix = dataset.map(function(d){
            return d3.values(d).slice(1,d.length).map(parseFloat);
        });
        console.log(matrix);
        //Transpose to get PCA from transposed attrs
        matrix = d3.transpose(matrix);

        var pca = new PCA();
        matrix = pca.scale(matrix,true,true);

        pc = pca.pca(matrix,2);

        return {
            a: pc[0], // this is the U matrix from SVD
            b: pc[1]  // this is the dV matrix from SVD
        }
    }

    function normalizedData (data) {
        //create dataset dynamically
        dataset = [];
        algorithms.forEach(function (algorithm, index) {
            var algorithmData = data[index];
            var item = {};

            algorithmData.forEach(function(teste, testeIndex){
                item['Teste '+ testeIndex] = teste['info']['total_converg'];
            });
            console.log(item);
            dataset.push(Object.assign({
                component: algorithm
            }, item));
        });

        //dataset = [
        //    {"component":"Algoritmo 1","Teste 1":12,"Teste 2":0,"Teste 3":2,"Teste 4":16,"Teste 5":25,"Teste 6":1},
        //    {"component":"Algoritmo 2","Teste 1":34,"Teste 2":13,"Teste 3":9,"Teste 4":8,"Teste 5":13,"Teste 6":10},
        //    {"component":"Algoritmo 3","Teste 1":4,"Teste 2":8,"Teste 3":1,"Teste 4":1,"Teste 5":3,"Teste 6":8},
        //    {"component":"Algoritmo 4","Teste 1":9,"Teste 2":0,"Teste 3":7,"Teste 4":0,"Teste 5":3,"Teste 6":3},
        //    {"component":"Algoritmo 5","Teste 1":44,"Teste 2":50,"Teste 3":47,"Teste 4":47,"Teste 5":50,"Teste 6":50},
        //    {"component":"Algoritmo 6","Teste 1":0,"Teste 2":9,"Teste 3":0,"Teste 4":0,"Teste 5":10,"Teste 6":0}
        //];

        var pc = getPCFromSVD(dataset);
        console.log(pc);

        var samples = Object.keys(dataset[0]);  // key values
        samples.shift(); // drop the first column label, e.g. "component"

        testes = samples
            .map(function(key, i) {
                return {
                    id: key,
                    pc1: pc.a[i][0],
                    pc2: pc.a[i][1]
                }
            });

        dataset.map(function(d,i){
            d.id = d.component;
            d.pc1 = pc.b[i][0]*6;
            d.pc2 = pc.b[i][1]*6;
        });

    }

    return {
        normalizedData: normalizedData,
        render: renderPcaPlots,
        update: updatePcaPlots
    };
}();