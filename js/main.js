var algorithms = ['pmx1', 'pmx2', 'pmx3', 'pmx4', 'pmx5', 'pmx6'];
var selectedAlgorithm = '0';
var selectedAlgorithm2 = '2';

!function(){
    var dataset;

    function subscribeSelection (selectId, index) {
        var selElem =  document.createElement('select');
        selElem.setAttribute('id', selectId + index);
        
        var optElem = document.createElement('option');
        algorithms.forEach(function(name, index){
            optElem.setAttribute('value', index);
            if (index === 0){
                optElem.setAttribute('selected', true);
            }

        })
        
        
        var mainElem = document.getElementById('#main');

        mainElem.appendChild(selElem);

        selElem.addEventListener('change', function(e) {
            selectedAlgorithm = this.value;

            document.getElementById('boxes' + index).remove();
            // document.getElementById('tree1').remove();
            document.getElementById('bars' + index).remove();
            document.getElementById('dendogram' + index).remove();
            document.getElementById('coordinates1' + index).remove();

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

    function plot(index) {
        var options = {
            viewsContainer: '#main',
            boxesId: 'boxes' + index,
            barsId: 'bars' + index,
            dendogramId: 'dendogram' + index,
            coordsId: 'coordinates' + index
        }

        // Box Plot
        var myBoxes = boxPlots(options.viewsContainer, options.boxesId);
        myBoxes.render(myBoxes.normalizeData(dataset[selectedAlgorithm]));

        //
        var mybars = barsPlot(options.viewsContainer, options.barsId);
        mybars.render(mybars.normalizeData(dataset[selectedAlgorithm]));
        //
        var myDendogram = dendogramPlot(options.viewsContainer, options.dendogramId);
        updateDataset('../scripts/treeData.json').then(function(treeData) {
            console.log(treeData);
            myDendogram.render(treeData[selectedAlgorithm]);
        });
        
        // var myTree = treePlot('tree1');
        // var treeData = myTree.normalizeData(dataset[selectedAlgorithm]);
        // myTree.render(treeData);

        // PCA
        // pcaPlots.normalizedData(dataset);
        // pcaPlots.init();

        var multidata = dataset[selectedAlgorithm].concat(dataset[selectedAlgorithm2]);
        var myCoordinate = coordinatesPlot(options.viewsContainer, options.coordsId);
        myCoordinate.render(multidata);
    }
    function renderDataset() {
        plot();

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

                // subscribeSelection('alg-select', 1);

            });
    }

    init();
}();