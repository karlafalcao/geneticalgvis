var algorithms = ['pmx1', 'pmx2', 'pmx3', 'pmx4', 'pmx5', 'pmx6'];
var testeQty = 10;
var selectedAlgorithm = '0';
!function(){
    //boxplots functions factory
    var dataset;

    // Object -> Object
    var parseInfo = R.map(parseFloat);
    var parseFitness = R.map(parseFloat, R.prop('fitness'));


    function subscribeSelection () {
        var selVal = document.getElementById('alg-select');

        selVal.addEventListener('change', function(e) {
            selectedAlgorithm = this.value;

            boxPlots.remove();

            boxPlots.normalizeData(dataset[selectedAlgorithm]);
            boxPlots.render();

            document.getElementById('#tree').remove();

            treePlot.normalizeData(dataset[selectedAlgorithm]);
            treePlot.init();

            document.getElementById('#radial-tree').remove();

            radialTreePlot.normalizeData(dataset[selectedAlgorithm]);
            radialTreePlot.init();

        });
    }

    function loadCSV (url) {
        return new Promise(function(resolve, reject){
            d3.csv(url, function(data) {
                resolve(data);
            });
        })
    }

    function loadDatasetForAlgorithm(alg) {

        var infoData = loadCSV('dados/'+ alg + '/info.csv');
        var gensData = loadCSV('dados/'+ alg + '/teste.csv');

        return Promise.all([
            infoData,
            gensData
        ]).then(function(data) {
            infoData = data[0];
            gensData = data[1];

            var dataset = Array(testeQty).fill().map(function (_, testIndex) {
                var item = {};

                // normalize info data
                
                item.info = parseInfo( infoData[testIndex] );

                //
                var population = item.info.populacao;
                var genQty = item.info.gen;

                item.fitness = [];
                item.variances = [];

                var gensInTest = R.slice(0, genQty * population, gensData);
                gensData = R.remove(0, genQty * population, gensData);
                
                item.gens = Array(genQty).fill().map(function(_, i) {
                    var gen = R.slice(0, population, gensInTest);
                    gensInTest = R.remove(0, population, gensInTest);

                    item.fitness[i] = gen.map(function(sample){ return parseFloat(sample.fitness); });
                    item.variances[i] =  d3.variance( item.fitness[i] );

                    return gen;
                });

                console.assert(item.gens.length === genQty, 'Generation qty is not correct!!');

                return item;
            });

            return dataset;
        });
    }

    function updateDataset() {
        //
        var promiseList = [];

        algorithms.forEach(function(alg) {
            promiseList.push(loadDatasetForAlgorithm(alg));
        });

        return Promise.all(promiseList);
    }

    function renderDataset(){

        boxPlots.render();

        // pcaPlots.render();

        //#end
    }

    function loadDataset() {

        // Box Plot
        boxPlots.normalizeData(dataset[selectedAlgorithm]);
        boxPlots.init();

        var mybarsPlot = barsPlot()
        // mybarsPlot.render(dataset[selectedAlgorithm]);
        mybarsPlot.render(barsData);

        treePlot.normalizeData(dataset[selectedAlgorithm]);
        treePlot.init();

        radialTreePlot.normalizeData(dataset[selectedAlgorithm]);
        radialTreePlot.init();

        // PCA
        // pcaPlots.normalizedData(dataset);
        // pcaPlots.init();
    }

    function init() {
        //#begin
        updateDataset()
            .then(function(data){
                dataset = data;
                console.log(data);
                //document.body.textContent = JSON.stringify(data);
                loadDataset();
                //render
                renderDataset();

                subscribeSelection();

            });
    }

    init();
}();