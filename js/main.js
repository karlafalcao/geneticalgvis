var algorithms = ['pmx1', 'pmx2', 'pmx3', 'pmx4', 'pmx5', 'pmx6'];
var testeQty = 10;
var selectedAlgorithm = '0';
!function(){
    var dataset;
    // Object -> Object
    var parseInfo = R.map(parseFloat);
    var getFitness = R.compose(parseFloat, R.prop('fitness'));
    var parseFitness = R.map(getFitness);

    function subscribeSelection () {
        var selVal = document.getElementById('alg-select');

        selVal.addEventListener('change', function(e) {
            selectedAlgorithm = this.value;

            document.getElementById('boxes1').remove();
            document.getElementById('tree1').remove();
            document.getElementById('radialTree1').remove();
            document.getElementById('bars1').remove();

            renderDataset();

        });
    }

    function loadCSV (url) {
        return new Promise(function(resolve, reject){
            d3.csv(url, function(data) {
                resolve(data);
            });
        })
    }

    function loadDatasetForAlgorithm() {

        var infoData = loadCSV('dados/pmx/info.csv');
        var gensData = loadCSV('dados/pmx/pmx.csv');

        return Promise.all([
            infoData,
            gensData
        ]).then(function(data) {
            infoData = data[0];
            gensData = data[1];
            var dataset = Array(6).fill().map(function (_, algIndex){
                return Array(testeQty).fill().map(function (_, testIndex) {
                    var item = {};

                    // normalize info data
                    
                    item.info = parseInfo( infoData[testIndex] );

                    //
                    var population = item.info.populacao;
                    var genQty = 250;

                    item.fitness = [];
                    item.variances = [];

                    var gensInTest = R.slice(0, genQty * population, gensData);
                    gensData = R.remove(0, genQty * population, gensData);
                    
                    item.gens = Array(genQty).fill().map(function(_, i) {
                        var gen = R.slice(0, population, gensInTest);
                        gen.map(function (d){
                            d.fitness = parseFloat(d.fitness);
                            return d;
                        });
                        gensInTest = R.remove(0, population, gensInTest);

                        item.fitness[i] = parseFitness(gen);
                        item.variances[i] =  d3.variance( item.fitness[i] );

                        return gen;
                    });
                    
                    console.assert(item.gens.length === genQty, 'Generation qty is not correct!!');

                    return item;
                });
            });

            return dataset;
        });
    }

    function updateDataset() {
        //
        var promiseList = [];

       /* algorithms.forEach(function(alg) {
            promiseList.push(loadDatasetForAlgorithm(alg));
        });
        */

        return loadDatasetForAlgorithm();
    }

    function renderDataset() {

        // Box Plot
        var myBoxes = boxPlots('boxes1');
        myBoxes.render(myBoxes.normalizeData(dataset[selectedAlgorithm]));

        //
        var mybars = barsPlot('bars1');
        // mybars.normalizeData(dataset[selectedAlgorithm]);
        mybars.render(mybars.normalizeData(dataset[selectedAlgorithm]));
        //

        var myTree = treePlot('tree1');
        var treeData = myTree.normalizeData(dataset[selectedAlgorithm]);
        myTree.render(treeData);

        var myRadialTree = radialTreePlot('radialTree1');
        myRadialTree.render(treeData);
        // PCA
        // pcaPlots.normalizedData(dataset);
        // pcaPlots.init();

        var myCoordinate = coordinatesPlot('coordinates1', dataset[selectedAlgorithm]);

        subscribeSelection();
        //#end
    }

    function init() {
        //#begin
        updateDataset()
            .then(function(data){
                dataset = data;
                console.log(data);
                //document.body.textContent = JSON.stringify(data);

                //render
                renderDataset();

            });
    }

    init();
}();