var hClust = require('ml-hclust');
var teste1 = require('./teste1');



var data = [
	[0,2,3,4,5,6],
	[8,4,12,3,1,1]
];

console.log(' #####-->>\nclustering>> ');
console.log(teste1.fitness);
console.log('\n <<--#####');


console.log(hClust.diana(teste1.fitness));