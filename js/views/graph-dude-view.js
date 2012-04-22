// graph
G.makeGraphDude = function(p) {    
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
        var lineSpace = 20 + G.graphGlobals.SCALE % 50;
        while (x >= 0) {
            p.line(x, 0, x, p.height);
            x -= lineSpace;
        }
        x = G.graphGlobals.ORIGIN_X;
        while (x <= p.width) {
            p.line(x, 0, x, p.height);
            x += lineSpace;
        }
        var y = G.graphGlobals.ORIGIN_Y;
        while (y >= 0) {
            p.line(0, y, p.width, y);
            y -= lineSpace;
        }
        y = G.graphGlobals.ORIGIN_Y;
        while (y <= p.height) {
            p.line(0, y, p.width, y);
            y += lineSpace;
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
        p.size(G.graphGlobals.START_W, G.graphGlobals.START_H);
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
            //G.graphGlobals.SCALE = Math.max(G.graphGlobals.SCALE + event.wheelDeltaY/5, 20);
            G.graphGlobals.SCALE += event.wheelDeltaY/5;
            graphDude.broadcast("dudeChanged");
            event.preventDefault();
        }
    }
    return graphDude;
};