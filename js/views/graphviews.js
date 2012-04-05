// graph
G.makeGraphDude = function(p) {
    var UNIT = 20,
    STEP = 1,
    START_W = 600,
    START_H = 600,
    ANCHOR_SIZE = 10,
    EPSILON = 10,
    originX, originY;
    
    var graphDude = G.makeDudeView();
    var graphReps = [];
    
    var newGraph = document.getElementById("graphPlus");
    newGraph.onclick = function() {
        graphDude.broadcast("newFunction");
    };
    
    function drawGrid() {
        p.background(250);
        
        // Gridlines
        p.stroke(230);
        p.strokeWeight(1);
        for (x = 0; x <= originX; x += UNIT) {
            p.line(originX + x, 0, originX + x, p.height);
            p.line(originX - x, 0, originX - x, p.height);
        }
        for (y = 0; y <= originY; y += UNIT) {
            p.line(0, originY + y, p.width, originY + y);
            p.line(0, originY - y, p.width, originY - y);
        }

        // Axes
        p.stroke(0);
        p.line(originX, 0, originX, p.height);
        p.line(0, originY, p.width, originY);
    }
    
    graphDude.display = function(functions) {
        drawGrid();
    };
    
    graphDude.onUpdate = function(data) {
        if (data && data.functions) {
            graphDude.display(data.functions);
        }
    }
    
    // SET UP PROCESSING
    p.setup = function () {
        p.size(START_W, START_H);
        originX = p.width/2;
        originY = p.height/2;
        p.smooth();
        drawGrid();
    };
    
    p.mouseClicked = function() {
        selectFunction();
    }

    p.mousePressed = function() {
        m.selectedFunction.mousePressed();
    }

    p.mouseDragged = function() {
        m.selectedFunction.mouseDragged();
    }

    p.mouseReleased = function() {
        m.selectedFunction.mouseReleased();
    }
    
    graphDude.endSuper();
    
    return graphDude;
};

// graph anchors
G.makeGraphRep = function(fun) {
    var graphRep = G.makeRepView();
    
    graphRep.display = function() {
        p.stroke(fun.color);
        p.strokeWeight(fun == m.selectedFunction ? 2 : 1);
        var p1 = G.makePoint({px:0, py:0});
        var p2;
        p1.uy(fun.evaluate(p1.ux()));
        
        while(p1.px() < p.width) {
            p2 = makePoint({px:p1.px() + STEP, py:0});
            p2.uy(fun.evaluate(p2.ux()));
            p.line(p1.px(), p1.py(), p2.px(), p2.py());
            p1 = p2;
        }

        if (fun == m.selectedFunction) {
            for (var a in fun.anchors) {
                fun.anchors[a].draw();
            }
        }
    };
    
    return graphRep;
};