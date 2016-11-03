//Width and height
var margin = {top: 20, right: 30, bottom: 20, left: 30};
var width = 800 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var dataset = [];

//boxplots functions factory
var boxplots;

function log(){
    var logList = [];
    for (var i in arguments){
        var logItem = arguments[i];

        if (typeof logItem === 'object') {
            logList.push(JSON.stringify(logItem));
            continue;
        }

        logList.push(String(logItem));
    }
    console.log('kpsf: ', logList);
}

var baseUrl = 'dados/teste/';

function loadCSV(url){
    return new Promise(function(resolve, reject){
        d3.csv(url, function(data) {
            resolve(data);
        })
    })
}

function updateDataset(){
    //
    var spaceData = [loadCSV(baseUrl + 'space.csv')];
    var infoData = Array(10).fill().map(function (_, i) { return loadCSV(baseUrl + 'info'+ i +'.csv')});
    var iterationsData = Array(10).fill().map(function (_, i) { return loadCSV(baseUrl + 'teste'+ i +'.csv')});

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
    var year = 2015;
    var temp = 'med';

    boxplots.update(year, temp);
    //#end
}

function loadDataset(dataset) {
    // Box Plot
    boxplots = getBoxPlots();
    boxplots.normalizeData(dataset);
    boxplots.render(dataset);
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