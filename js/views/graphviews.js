G.graphGlobals = {
    SCALE: 40,
    PIXEL_STEP: 1,
    START_W: 600,
    START_H: 600,
    ANCHOR_SIZE: 10,
    ANCHOR_BUFFER: 20,
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
    
    var newGraph = document.getElementById("graphPlus");
    newGraph.onclick = function() {
        graphDude.broadcast("newFunction");
    };
    
    function drawGrid() {
        p.background(250);
        
        // Gridlines
        p.stroke(230);
        p.strokeWeight(1);
        var x = G.graphGlobals.ORIGIN_X;
        while (x >= 0) {
            p.line(x, 0, x, p.height);
            x -= G.graphGlobals.SCALE;
        }
        x = G.graphGlobals.ORIGIN_X;
        while (x <= p.width) {
            p.line(x, 0, x, p.height);
            x += G.graphGlobals.SCALE;
        }
        var y = G.graphGlobals.ORIGIN_Y;
        while (y >= 0) {
            p.line(0, y, p.width, y);
            y -= G.graphGlobals.SCALE;
        }
        y = G.graphGlobals.ORIGIN_Y;
        while (y <= p.height) {
            p.line(0, y, p.width, y);
            y += G.graphGlobals.SCALE;
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
        p.noLoop();
        drawGrid();
    };
    
    p.mouseClicked = function() {
        graphDude.broadcast("mouseClicked", {
            mouseX: p.mouseX,
            mouseY: p.mouseY
        });
    }

    p.mousePressed = function() {
        graphDude.broadcast("mousePressed", {
            mouseX: p.mouseX,
            mouseY: p.mouseY
        });
    }

    p.mouseDragged = function() {
        graphDude.broadcast("mouseDragged", {
            mouseX: p.mouseX,
            mouseY: p.mouseY,
            dx: p.mouseX - p.pmouseX,
            dy: p.mouseY - p.pmouseY
        });
    }

    p.mouseReleased = function() {
        graphDude.broadcast("mouseReleased", {
            mouseX: p.mouseX,
            mouseY: p.mouseY
        });
    }
    
    window.onmousewheel = function(event) {
        if (event.target.id === "graphCanvas") {
            G.graphGlobals.SCALE = Math.max(G.graphGlobals.SCALE + event.wheelDeltaY/5, 20);
            graphDude.broadcast("dudeChanged");
            event.preventDefault();
        }
    }
    return graphDude;
};

// graph anchors
G.makeGraphRep = function(fun, p) {
    var rep = G.makeRepView(fun);
    
    var repData = fun.repData("graph");
    var selectedAnchor = null;
    
    rep.display = function() {
        p.stroke(fun.color.r, fun.color.g, fun.color.b);
        p.strokeWeight(fun.isSelected ? 2 : 1);

        var pixel1 = G.makePoint(0,0);
        var unit1 = G.graphGlobals.pixelToUnit(pixel1);
        unit1.y(fun.evaluate(unit1.x()));
        pixel1 = G.graphGlobals.unitToPixel(unit1);
        
        var unit2, pixel2;
        p.noFill();
        p.beginShape();
        while(pixel1.x() < p.width) {
            pixel2 = G.makePoint(pixel1.x() + G.graphGlobals.PIXEL_STEP, 0);
            unit2 = G.graphGlobals.pixelToUnit(pixel2);
            unit2.y(fun.evaluate(unit2.x()));
            pixel2 = G.graphGlobals.unitToPixel(unit2);
            
            p.vertex(pixel1.x(), pixel1.y());
            pixel1 = pixel2;
        }
        p.endShape();
        if (fun.isSelected) {
            for (a in repData) {
                repData[a].x && drawAnchor(repData[a]);
            }
        }
    };
    
    rep.select = function(mouseX, mouseY) {
        // select function
        var pixel1 = G.makePoint(0,0);
        var unit1 = G.graphGlobals.pixelToUnit(pixel1);
        unit1.y(fun.evaluate(unit1.x()));
        pixel1 = G.graphGlobals.unitToPixel(unit1);
                
        while(pixel1.x() < p.width) {
            if (p.dist(pixel1.x(), pixel1.y(), mouseX, mouseY) < G.graphGlobals.EPSILON) {
                rep.broadcast("selectFunction", {fun: rep.fun});
                return;
            }
            
            pixel1.x(pixel1.x() + G.graphGlobals.PIXEL_STEP);
            var unit1 = G.graphGlobals.pixelToUnit(pixel1);
            unit1.y(fun.evaluate(unit1.x()));
            pixel1 = G.graphGlobals.unitToPixel(unit1);
        }
    };
    
    rep.press = function(mouseX, mouseY) {
        // press anchor
        if (fun.isSelected) {
            for (a in repData) {
                var anchor = repData[a];
                if (anchor.x && p.dist(anchor.x(), anchor.y(), mouseX, mouseY) < G.graphGlobals.EPSILON) {
                    repData[a].isSelected = true;
                    return true;
                }
            }
        }
        return false;
    };
    
    rep.release = function() {
        selectedAnchor = null;
        for (a in repData) {
            repData[a].isSelected = false;
        }
    }
    
    rep.drag = function(mouseX, mouseY) {
        // drag anchor
        //console.log("before" + repData.rotate.x() + ", " + repData.rotate.y());
        for (a in repData) {
            if (repData[a].isSelected) {
                repData[a].x(mouseX);
                repData[a].y(mouseY);
                repData.changed = repData[a].name;
                rep.broadcast("repChanged", {fun: fun, repData: repData});
                return true;
            }
        }
        return false;
    };
    
    function drawAnchor(pt) {
        p.stroke(fun.color.r, fun.color.g, fun.color.b);
        p.fill(fun.color.r, fun.color.g, fun.color.b);
        p.ellipseMode(p.CENTER);
        p.ellipse(pt.x(), pt.y(), G.graphGlobals.ANCHOR_SIZE, G.graphGlobals.ANCHOR_SIZE);
    }
    
    return rep;
};
