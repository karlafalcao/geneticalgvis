var d3 = require('d3');
var jsonfile = require('jsonfile')
var path = require('path')
var Promise = require('promise')
 
var file = path.resolve('data.json')
 
!function() {
    var dataPath = 'dados/';
    var karla = JSON.stringify({karla: 'linda'});

    var fetchingData = true;

    function loadCSV(url){
        return new Promise(function(resolve, reject){
            d3.csv(url, function(data) {
                resolve(data);
            });
        })
    }

    function loadDatasetForAlgorithm(alg) {
        console.log(dataPath);
        console.log(alg);
        var infoData = Array(10).fill().map(function (_, i) { return loadCSV(dataPath + alg + '/info'+ i +'.csv')});
        var iterationsData = Array(10).fill().map(function (_, i) { return loadCSV(dataPath + alg + '/teste'+ i +'.csv')});

        return Promise.all([
            Promise.all(infoData),
            Promise.all(iterationsData)]
        ).then(function(data) {
            infoData = data[0];
            iterationsData = data[1];

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

                var population = 20;
                var iterations = iterationsData[testIndex];
                item.variances = [];
                item.iterations = Array(parseInt(iterations.length/population)).fill().map(function(_, i) {
                    var iteration = iterations.slice(i*population, (i+1)*population).map(function(sample){
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

    var generateData = function(){

        var promiseList = [];
        var algorithms = ['pmx1', 'pmx2', 'pmx3', 'pmx4', 'pmx5', 'pmx6'];

        algorithms.forEach(function(alg) {
            promiseList.push(loadDatasetForAlgorithm(alg));
        });

        return Promise.all(promiseList);
    };

    function onGenerateData() {
        return generateData().then(function(data) {
            var strData = JSON.stringify(data);
            console.log(strData);
            
            fetchingData = false;
            
            jsonfile.writeFileSync(file, strData);
            
            console.log('Json gerado!!');
        });
    }

    return onGenerateData();
}();