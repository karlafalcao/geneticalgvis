//boxplots functions factory
var boxplots;
var alg = 'algoritmo2'
var baseUrl = 'dados/'+ alg;

function loadCSV(url){
    return new Promise(function(resolve, reject){
        d3.csv(url, function(data) {
            resolve(data);
        })
    })
}

function updateDataset() {
    //
    var spaceData = [loadCSV('dados/space.csv')];
    var infoData = Array(10).fill().map(function (_, i) { return loadCSV(baseUrl + '/info'+ i +'.csv')});
    var iterationsData = Array(10).fill().map(function (_, i) { return loadCSV(baseUrl + '/teste'+ i +'.csv')});

    return Promise.all([
        Promise.all(spaceData),
        Promise.all(infoData),
        Promise.all(iterationsData)]
    ).then(function(data) {
        console.log(data);
        infoData = data[1];
        iterationsData = data[2];

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
            var population = 50;
            var iterations = iterationsData[testIndex];
            item.variances = [];
            item.iterations = Array(iterations.length/population).fill().map(function(_, i) {
                var iteration = iterations.slice(i*50, (i+1)*50).map(function(sample){
                    sample.fitness = parseFloat(sample.fitness);
                    return sample;
                });

                item.variances[i] =  d3.variance(iteration.map(function(sample){ return sample.fitness; }));

                return iteration;
            });

            console.log(item);
            return item;
        });

        return dataset;
    });
}

function getBoxPlots () {
    return algenBoxPlots;
}

function renderDataset(){

    boxplots.update();

    //#end
}

function loadDataset(dataset) {
    // Box Plot
    boxplots = getBoxPlots();
    boxplots.normalizeData(dataset);
    boxplots.render();
    
    // PCA
    pcaPlots.render();
    pcaPlots.update(dataset);
}

function init(){
    //#begin
    updateDataset()
        .then(function(dataset){
            console.log(dataset);
            loadDataset(dataset);
            //render
            renderDataset();
            
        });
}

init();