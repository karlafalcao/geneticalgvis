var hclust = require('ml-hclust');
var euclidean = require('ml-distance-euclidean');

var data = [
    [2,6],
    [3,4],
    [3,8],
    [4,5],
    [4,7],
    [6,2],
    [7,2],
    [7,4],
    [8,4],
    [8,5]
];

var distance = new Array(data.length);
for(var i = 0; i < data.length; ++i) {
    distance[i] = new Array(data.length);
    for (var j = 0; j < data.length; ++j) {
        distance[i][j] = euclidean(data[i], data[j]);
    }
}


console.log(' -> ');

var diana = hclust.diana(data);

// diana.distance.should.be.approximately(3.1360, 0.001);
console.log(diana.children);
console.log(JSON.stringify(diana.children));