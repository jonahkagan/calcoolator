G.graphGlobals = {
    SCALE: 20,
    PIXEL_STEP: 1,
    START_W: 600,
    START_H: 600,
    ANCHOR_SIZE: 10,
    EPSILON: 10,
    ORIGIN_X: 0,
    ORIGIN_Y: 0,
    
    pixelToUnit: function(pt) {
        var ux = (pt.x() - G.graphGlobals.ORIGIN_X) / G.graphGlobals.SCALE;
        var uy = -1 * (pt.y() - G.graphGlobals.ORIGIN_Y) / G.graphGlobals.SCALE;
        return G.makePoint(ux, uy);
    },
    
    unitToPixel: function(pt) {
        var px = (pt.x() * G.graphGlobals.SCALE) + G.graphGlobals.ORIGIN_X;
        var py = -1 * (pt.y() * G.graphGlobals.SCALE) + G.graphGlobals.ORIGIN_Y;
        return G.makePoint(px, py);
    }
};

// graph
G.makeGraphDude = function(p) {
    // TODO: refactor references to these local constants:
    var SCALE = 20,
    START_W = 600,
    START_H = 600,
    ANCHOR_SIZE = 10,
    EPSILON = 10;
    
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
        for (x = 0; x <= G.graphGlobals.ORIGIN_X; x += SCALE) {
            p.line(G.graphGlobals.ORIGIN_X + x, 0, G.graphGlobals.ORIGIN_X + x, p.height);
            p.line(G.graphGlobals.ORIGIN_X - x, 0, G.graphGlobals.ORIGIN_X - x, p.height);
        }
        for (y = 0; y <= G.graphGlobals.ORIGIN_Y; y += SCALE) {
            p.line(0, G.graphGlobals.ORIGIN_Y + y, p.width, G.graphGlobals.ORIGIN_Y + y);
            p.line(0, G.graphGlobals.ORIGIN_Y - y, p.width, G.graphGlobals.ORIGIN_Y - y);
        }

        // Axes
        p.stroke(0);
        p.line(G.graphGlobals.ORIGIN_X, 0, G.graphGlobals.ORIGIN_X, p.height);
        p.line(0, G.graphGlobals.ORIGIN_Y, p.width, G.graphGlobals.ORIGIN_Y);
    }
    
    graphDude.display = function(functions) {
        drawGrid();
    };
    
    
    // SET UP PROCESSING
    p.setup = function () {
        p.size(START_W, START_H);
        G.graphGlobals.ORIGIN_X = p.width/2;
        G.graphGlobals.ORIGIN_Y = p.height/2;
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
        
    return graphDude;
};

// graph anchors
G.makeGraphRep = function(fun, p) {
    var rep = G.makeRepView(fun);
    
    var repData = fun.getRepData("graph");
    
    rep.display = function() {
        p.stroke(fun.color.r, fun.color.g, fun.color.b);
        p.strokeWeight(fun.isSelected ? 2 : 1);
        var p1 = G.makePoint(0,0);
        var p2;
        p1.y(fun.evaluate(p1.x()));
        
        var pixel1 = G.makePoint(0,0);
        var unit1 = G.graphGlobals.pixelToUnit(pixel1);
        unit1.y(fun.evaluate(unit1.x()));
        pixel1 = G.graphGlobals.unitToPixel(unit1);
        
        var unit2, pixel2;
        
        while(pixel1.x() < p.width) {
            pixel2 = G.makePoint(pixel1.x() + G.graphGlobals.PIXEL_STEP, 0);
            unit2 = G.graphGlobals.pixelToUnit(pixel2);
            unit2.y(fun.evaluate(unit2.x()));
            pixel2 = G.graphGlobals.unitToPixel(unit2);
            
            p.line(pixel1.x(), pixel1.y(), pixel2.x(), pixel2.y());
            pixel1 = pixel2;
        }

        if (fun.isSelected) {
            switch(fun.degree) {
                case 1:
                    drawLineAnchors();
                    break;
                case 2:
                    drawParabolaAnchors();
                    break;
            }
        }
        
    };
    
    function drawLineAnchors() {
        drawAnchor(repData.translate);
        drawAnchor(repData.rotate);
    }
    
    function drawParabolaAnchors() {
        drawAnchor(repData.translate);
        drawAnchor(repData.bend);
    }
    
    function drawAnchor(pt) {
        console.log('drawing anchor');
        p.stroke(fun.color.r, fun.color.g, fun.color.b);
        p.fill(fun.color.r, fun.color.g, fun.color.b);
        p.ellipseMode(p.CENTER);
        p.ellipse(pt.x(), pt.y(), G.graphGlobals.ANCHOR_SIZE, G.graphGlobals.ANCHOR_SIZE);
    }
    
    return rep;
};