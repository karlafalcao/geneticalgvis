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

console.log(' -> ');

var diana = hclust.diana(data);

// diana.distance.should.be.approximately(3.1360, 0.001);
console.log(diana.children);
console.log(JSON.stringify(diana.children));