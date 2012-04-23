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
        p.fill(170);
        var x = G.graphGlobals.ORIGIN_X;
        var lineSpace = 40 + G.graphGlobals.SCALE % 40;
        var lineCount = 0;
        var unitCount = 0;

        while (x >= 0) {
            if (lineCount % 4 === 0 && lineCount > 0) {
                p.stroke(170);
                var label = (G.graphGlobals.ORIGIN_X - x) / G.graphGlobals.pixelsPerUnit();
                p.text("-" + label, x+4, G.graphGlobals.ORIGIN_Y + 17);
            }
            else {
                p.stroke(230);
            }
            p.line(x, 0, x, p.height);
            x -= lineSpace;
            lineCount++;
        }
        lineCount = 0;
        x = G.graphGlobals.ORIGIN_X;
        while (x <= p.width) {
            if (lineCount % 4 === 0) {
                p.stroke(170);
                var label = (x - G.graphGlobals.ORIGIN_X) / G.graphGlobals.pixelsPerUnit();
                p.text(label, x+4, G.graphGlobals.ORIGIN_Y + 17);
            }
            else {
                p.stroke(230);
            }
            p.line(x, 0, x, p.height);
            x += lineSpace;
            lineCount++;
        }
        var y = G.graphGlobals.ORIGIN_Y;
        lineCount = 0;
        while (y >= 0) {
            if (lineCount % 4 === 0 && lineCount !== 0) {
                p.stroke(170);
                var label = (G.graphGlobals.ORIGIN_Y - y) / G.graphGlobals.pixelsPerUnit();
                p.text(label, G.graphGlobals.ORIGIN_X + 4, y-1);
            }
            else {
                p.stroke(230);
            }
            p.line(0, y, p.width, y);
            y -= lineSpace;
            lineCount++;
        }
        y = G.graphGlobals.ORIGIN_Y;
        lineCount = 0;
        while (y <= p.height) {
            if (lineCount % 4 === 0 && lineCount !== 0) {
                p.stroke(170);
                var label = (G.graphGlobals.ORIGIN_Y - y) / G.graphGlobals.pixelsPerUnit();
                p.text(label, G.graphGlobals.ORIGIN_X + 4, y-1);
            }
            else {
                p.stroke(230);
            }
            p.line(0, y, p.width, y);
            y += lineSpace;
            lineCount++;
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
        p.textFont(p.loadFont("lib/font/Symbola.ttf"));
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
            //G.graphGlobals.SCALE += event.wheelDeltaY/5;
            /*
            console.log(event.wheelDeltaY);
            if (event.wheelDeltaY > 0) {
                G.graphGlobals.SCROLL_SCALE += 20;
            }
            else {
                G.graphGlobals.SCROLL_SCALE -= 20;
            }
            G.graphGlobals.SCALE = G.graphGlobals.SCROLL_SCALE / 40.0;
            */
            graphDude.broadcast("dudeChanged", {action: "zoom"});
            event.preventDefault();
        }
    }
    return graphDude;
};