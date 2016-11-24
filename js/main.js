var algorithms = ['pmx1', 'pmx2', 'pmx3', 'pmx4', 'pmx5', 'pmx6'];
var selectedAlgorithm = '0';
!function(){
    //boxplots functions factory
    var dataset;

    function subscribeSelection(){
        var selVal = document.getElementById('alg-select');
        selVal.addEventListener('change', function(e) {
            selectedAlgorithm = this.value;
            boxPlots.remove();
            boxPlots.normalizeData(dataset[selectedAlgorithm]);
            boxPlots.render();

        })
    }

    function loadCSV(url){
        return new Promise(function(resolve, reject){
            d3.csv(url, function(data) {
                resolve(data);
            });
        })
    }

    function loadDatasetForAlgorithm(alg) {
        var infoData = Array(10).fill().map(function (_, i) { return loadCSV('dados/'+ alg + '/info'+ i +'.csv')});
        var gensData = Array(10).fill().map(function (_, i) { return loadCSV('dados/'+ alg + '/teste'+ i +'.csv')});

        return Promise.all([
            Promise.all(infoData),
            Promise.all(gensData)]
        ).then(function(data) {
            infoData = data[0];
            gensData = data[1];

            var dataset = Array(10).fill().map(function (_, testIndex) {
                var item = {};

                // set info attr
                item.info = {};
                var info = infoData[testIndex];

                info.forEach(function (feature) {
                    var attr = feature[info.columns[0]];
                    var value = feature[info.columns[1]];
                    item.info[attr] = attr === 'fitmedio' ? parseFloat(value) : parseInt(value);
                });

                //
                var population = item.info.populacao;
                var gens = gensData[testIndex];
                item.variances = [];
                item.gens = Array(parseInt(gens.length/population)).fill().map(function(_, i) {
                    var iteration = gens.slice(i*population, (i+1)*population).map(function(sample){
                        sample.fitness = parseFloat(sample.fitness);
                        return sample;
                    });

                    item.variances[i] =  d3.variance(iteration.map(function(sample){ return sample.fitness; }));

                    return iteration;
                });

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

        pcaPlots.render();


        //#end
    }

    function loadDataset() {

        // Box Plot
        boxPlots.normalizeData(dataset[selectedAlgorithm]);
        boxPlots.init();

        // PCA
        pcaPlots.normalizedData(dataset);
        pcaPlots.init();

        tree.normalizeData(dataset[selectedAlgorithm]);
        tree.init();
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