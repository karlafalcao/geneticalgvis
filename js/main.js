var algorithms = ['pmx1', 'pmx2', 'pmx3', 'pmx4', 'pmx5', 'pmx6'];
var selectedAlgorithm = '0';
var selectedAlgorithm2 = '2';

!function(){
    var dataset;
    var treeData;

    function subscribeSelection (selectId, index) {
        var selElem =  document.createElement('select');
        selElem.setAttribute('id', selectId + index);
        
        algorithms.forEach(function(name, i){
            var optElem = document.createElement('option');
            optElem.setAttribute('value', i);
            optElem.textContent = name;

            if (index === 0){
                optElem.setAttribute('selected', true);
            }
            selElem.append(optElem);
        });

        var mainElem = document.getElementById('main');

        mainElem.append(selElem);

        selElem.addEventListener('change', function(e) {
            selectedAlgorithm = this.value;

            document.getElementById('boxes' + index).remove();
            document.getElementById('bars' + index).remove();
            document.getElementById('dendogram' + index).remove();

            plot(index);

        });
    }

    function getJson(url) {
        return new Promise(function(resolve){
            d3.json(url, function(data) {
                resolve(data);
            });
        });
    }

    function updateDataset(urlList) {   
        return Promise.all(urlList.map(function(url){
            return getJson(url);
        }));
    }
    var myCoordinate;
    function getOptions(index){
        console.assert(index !== undefined);
        return {
            viewsContainer: '#view' + index,
            boxesId: 'boxes' + index,
            barsId: 'bars' + index,
            dendogramId: 'dendogram' + index
        }
    }
    

    function plot(index) {
       
        var options = getOptions(index);
        //
        var mybars = barsPlot(options.viewsContainer, options.barsId);
        mybars.render(mybars.normalizeData(dataset[selectedAlgorithm]));
        
        // Box Plot
        var myBoxes = boxPlots(options.viewsContainer, options.boxesId);
        myBoxes.render(myBoxes.normalizeData(dataset[selectedAlgorithm]));

        //
        var myDendogram = dendogramPlot(options.viewsContainer, options.dendogramId);
        myDendogram.render(treeData[selectedAlgorithm]);

        var multidata = dataset[selectedAlgorithm].concat(dataset[selectedAlgorithm2]);
        myCoordinate.render(multidata);

        // var myTree = treePlot('tree1');
        // var treeData = myTree.normalizeData(dataset[selectedAlgorithm]);
        // myTree.render(treeData);

        // PCA
        // pcaPlots.normalizedData(dataset);
        // pcaPlots.init();

    }

    function renderDataset(index) {
        
        plot(index);

        // subscribe option
        subscribeSelection('alg-select', index);
    }

    function init() {
        //#begin
        updateDataset([
            '../scripts/pmx.json',
            '../scripts/treeData.json'
            ])
            .then(function(data){
                
                //
                dataset = data[0];
                treeData = data[1];
                
                myCoordinate = coordinatesPlot('#main', 'coordinates');
                
                //render
                renderDataset(1);
                renderDataset(2);
                
                //#end
            });
    }

    init();
}();