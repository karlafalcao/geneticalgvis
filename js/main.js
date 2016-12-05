var algorithms = ['pmx1', 'pmx2', 'pmx3', 'pmx4', 'pmx5', 'pmx6'];
var selectedAlgorithm = '0';

!function(){
    var dataset;

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

    function updateDataset(url) {
        return new Promise(function(resolve){
            d3.json(url, function(data) {
                resolve(data);
            });
        });
    }

    function renderDataset() {

        // Box Plot
        var myBoxes = boxPlots('boxes1');
        myBoxes.render(myBoxes.normalizeData(dataset[selectedAlgorithm]));
        //

        var mybars = barsPlot('bars1');
        mybars.render(mybars.normalizeData(dataset[selectedAlgorithm]));
        //
        var myDendogram = dendogramPlot('dendogram1');
        updateDataset('../scripts/treeData.json').then(function(treeData) {
            myDendogram.render(treeData);
        });
        
        // var myTree = treePlot('tree1');
        // var treeData = myTree.normalizeData(dataset[selectedAlgorithm]);
        // myTree.render(treeData);

        // var myRadialTree = radialTreePlot('radialTree1');
        // myRadialTree.render(treeData);
        // PCA
        // pcaPlots.normalizedData(dataset);
        // pcaPlots.init();

        var myCoordinate = coordinatesPlot('coordinates1', dataset[selectedAlgorithm]);

        subscribeSelection();
        //#end
    }

    function init() {
        //#begin
        updateDataset('../scripts/pmx.json')
            .then(function(data){
                dataset = data;
                console.log(data);

                //render
                renderDataset();

            });
    }

    init();
}();