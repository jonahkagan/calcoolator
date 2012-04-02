// graph
G.makeGraphDude = function(p) {
    var graphDude = G.makeDudeView();
    var newGraph = document.getElementById("graphPlus");
    
    newGraph.onclick = function() {
        graphDude.broadcast("newFunction");
    };
    
    function drawGrid() {
        
    }
    
    function drawFunctions(functions) {
        
    }
    
    graphDude.display = function(functions) {
        // draw functions
    };
    
    graphDude.onUpdate = function(data) {
        if (data && data.functions) {
            graphDude.display(data.functions);
        }
    }
    
    graphDude.endSuper();
    
    return graphDude;
};

// graph anchors
G.makeGraphRep = function() {
    var graphRep = G.makeRepView();
    
    graphRep.display = function() {
        
    };
    
    return graphRep;
};