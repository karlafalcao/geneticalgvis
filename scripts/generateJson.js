var d3 = require('d3');
var fs = require('fs')
var path = require('path');
var R = require('ramda');
var hclust = require('ml-hclust');
var euclidean = require('ml-distance-euclidean');
var parser = require("biojs-io-newick");
var newick = require("./newick.js");

//vars
var TEST_QTY = 10;
var TEST_PREFIX = 'Teste';
var ALG_QTY = 6;
var genQty = 250;

var parseInfo = R.map(parseFloat);

var getFitness = R.compose(parseFloat, R.prop('fitness'));

var parseFitness = R.map(getFitness);

var clusteredData = {};

var leaves = {};

function writeJson (data, fileName) {

    fs.writeFileSync(fileName, typeof data == 'object' ? JSON.stringify(data) : data);

    return fs.readFileSync(path.resolve(fileName)).toString();
}

function readCSV(file){
    return d3.csvParse(
        fs.readFileSync(path.resolve(file)).toString()
    );
}

function getClusterDataFromTest(data){
    var configsByInfo = new Array();
    
    for (var config in data) {
        
        var value = data[config];
        if (value[0] < 30) continue;

        if (!configsByInfo[JSON.stringify(value)]) {
            configsByInfo[JSON.stringify(value)] = [];
        }
        configsByInfo[JSON.stringify(value)].push(config);
    }

    //
    var dataToCluster = Object.keys(configsByInfo).map(function(info){
        return JSON.parse(info);
    }).sort(function(a, b) { return a[0] - b[0]; });
    
    // agness: default dist
    var agnes = hclust.agnes(dataToCluster, {kind: 'complete'});
    // console.log(agnes.cut(1.5));
    // var agnes = hclust.agnes(getDistanceMatrix(dataToCluster), {useDistanceMatrix: true});
    // console.log(JSON.stringify(agnes));

    // console.log(agnes.distance);
    // console.assert(agnes.distance <= 3.1360 && agnes.distance >= 0.001);
    // console.assert(agnes.distance <= 1886.0001 && agnes.distance >= 0.001);
    
    return {
        agnes: agnes,
        info: dataToCluster,
        configs: configsByInfo,
    };
}

//author: https://github.com/daviddao/biojs-io-newick
function parseJson (json) {
    var name = "";
    
    function nested(nest){
        var subtree = "";

        if(nest.hasOwnProperty('children') && nest.children.length > 0) {
            if (nest.hasOwnProperty('index') &&
                ['string'].indexOf(typeof nest.index) !== -1 &&
                nest.index.length > 0) {
                name = nest.index;

            }
            var children = [];
            nest.children.forEach(function(child){
                var subsubtree = nested(child);
                children.push(subsubtree);
            });
            var substring = children.join();
            
            if(nest.hasOwnProperty('index')){
                subtree = "("+substring+")" + name;
            }
            if(nest.hasOwnProperty('distance')){
                subtree = subtree + ":"+nest.distance;
            }
        }
        else {
            var leaf = "";
            if(nest.hasOwnProperty('index')){

                leaf = name + '_'+ (['string', 'number'].indexOf(typeof nest.index) !== -1 ? nest.index : '' );

                var info = clusteredData[name].info[nest.index];
                var infoStr = JSON.stringify(info);

                var config = JSON.stringify(clusteredData[name].configs[infoStr]).split(' ').join('');

                // console.log(config);
                leaves[leaf] = {
                    config: config,
                    info: {
                        occurrences: info[0],
                        fitness: info[1]
                    }
                }

            }
            if(nest.hasOwnProperty('distance')){
                leaf = leaf + ":"+nest.distance;
            }
            subtree = subtree + leaf;
        }
        return subtree;
    }
    return nested(json) +";";
};


function getDistanceMatrix(data) {

    var distance = new Array(data.length);
    for(var i = 0; i < data.length; ++i) {
        distance[i] = new Array(data.length);
        for (var j = 0; j < data.length; ++j) {
            distance[i][j] = euclidean(data[i], data[j]);
        }
    }

    return distance;
}


function normalizeDataForDendogram(data) {
    var indivOccurrences = {};
    
    //calculate configs frequencies in tests
    data.forEach(function(sample, sampleIndex) {
        var testLabel = TEST_PREFIX + (sampleIndex+1);

        sample.gens.forEach(function(gen, genIndex) {

            gen.forEach( function(indiv, indivIndex) {

                var config = indiv.config;
                var fitness = indiv.fitness;

                if (!indivOccurrences[testLabel]) { 
                    indivOccurrences[testLabel] = {};
                }

                if (indivOccurrences[testLabel] && !indivOccurrences[testLabel][config]) {
                    indivOccurrences[testLabel][config] = [0 , fitness];
                }

                indivOccurrences[testLabel][config][0]++;
            });
        });
    });

    var agnesTree = {
        children: [],
        distance: 1,
        index: ''
    };    

    for (test in indivOccurrences) {
        clusteredData[test] = getClusterDataFromTest(indivOccurrences[test]);

        var testChild = clusteredData[test].agnes;
        
        testChild.index = test;
        
        agnesTree.children.push(testChild);
    }

    var newickData = parseJson(agnesTree);

    console.log(leaves);
    // console.log(newickData);
    // console.assert(newickData === "(A:0.1,B:0.2,(C:0.3,D:0.4)E:0.5):0.4;", function(){console.log(arguments)});
    
    //dendogram parse newick
    return  {
        tree: newick.parse(newickData),
        leaves: leaves
    }
    
}


function generateData(csvInfoFile, csvGensFile) {
    var infoData = readCSV(csvInfoFile);
    var gensData = readCSV(csvGensFile);

    // console.log(infoData);
    // console.log(gensData);
    
    var dataset = Array(ALG_QTY).fill().map(function (_, algIndex){
        var infoInAlg = R.slice(0, TEST_QTY, infoData);
        infoData = R.remove(0, TEST_QTY, infoData);

        return Array(TEST_QTY).fill().map(function (_, testIndex) {
            var item = {};

            // normalize info data
            item.info = parseInfo( infoInAlg[testIndex] );

            //
            var population = item.info.populacao;
            

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
}

function main() {

    var pmxDataset = generateData(
        '../dados/pmx/info.csv', 
        '../dados/pmx/pmx.csv'
    );

    var orderDataset = generateData(
        '../dados/order1/info_order1.csv', 
        '../dados/order1/order1.csv'
    );
    
    
    var edgeDataset = generateData(
        '../dados/edge/info_edge.csv', 
        '../dados/edge/edge.csv'
    );

    var cutcrossDataset = generateData(
        '../dados/cutcross/info_cutcross.csv', 
        '../dados/cutcross/cutcross.csv'
    );

    var dataset = pmxDataset
        .concat(orderDataset)
        .concat(edgeDataset)
        .concat(cutcrossDataset);

    // console.log(edgeDataset);

    writeJson(dataset, 'dataset.json');
    
    
    //normalize for PMX1
    var dendogramDataset = dataset.map(function(item) {
        return normalizeDataForDendogram(item).tree;
    });
    writeJson(dendogramDataset, 'treeData.json');
    
    //normalize for PMX1
    var leavesDataset = dataset.map(function(item) {
        return normalizeDataForDendogram(item).leaves;
    });

    // console.log(dendogramDataset);
    writeJson(leavesDataset, 'leaves.json');
}

main();