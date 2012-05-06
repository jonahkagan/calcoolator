// graph
G.makeGraphDude = function(p) {    
    var graphDude = G.makeDudeView();
    
    var newGraph = document.getElementById("graphPlus");
    newGraph.onclick = function() {
        graphDude.broadcast("newFunction");
    };
    
    function drawGrid() {
        p.redraw();
    }

    p.draw = function () {
        //console.log("drawing");
        p.background(250);

        var PPU = G.graphGlobals.SCALE, // pixels per unit
            // how many units fit on the screen
            maxUnits = Math.max(p.width, p.height) / PPU,
            // how many powers of 10 each major line represents in units
            lineScale = Math.floor(_.logBase(10, PPU)) - 1,
            // intermediate step values between this lineScale and
            // the next
            possibleSteps = _.map([1, 2, 5], function (n) {
                // 1/10^lineScale is how many units our basic step
                // would be at this lineScale
                return n * Math.pow(10, -lineScale);
            }),
            // how far apart major lines are in units
            // we want the step that yields the most major lines
            majorStep = _.first(_.sortBy(possibleSteps, function (step) {
                // how close step is to fitting the target
                // num of lines on the screen
                return Math.abs(maxUnits / step - G.graphGlobals.MAJOR_LINES);
            })),
            // how far apart minor lines are in units
            minorStep = majorStep / 5;

        function drawLines(step, drawLine) {
            _.each( // for each unit
                _.range(0, // from the origin
                        maxUnits, // to the wall
                        step), // with this step
                function (u) {
                    drawLine(u);
                    drawLine(-u);
                }
            );
        }

        p.strokeWeight(1);

        // Gridlines
        p.stroke(230);
        drawLines(minorStep, drawVert(false));
        drawLines(minorStep, drawHorz(false));

        p.stroke(170);
        p.fill(170);
        drawLines(majorStep, drawVert(true));
        drawLines(majorStep, drawHorz(true));

        // Axes
        p.stroke(0);
        p.line(G.graphGlobals.ORIGIN_X, 0, G.graphGlobals.ORIGIN_X, p.height);
        p.line(0, G.graphGlobals.ORIGIN_Y, p.width, G.graphGlobals.ORIGIN_Y);
    }

    function drawVert(label) {
        return function (ux) {
            var px = G.graphGlobals.unitToPixel(G.makePoint(ux,0)).x();
            if (px < p.width && px > 0) {
                p.line(px, 0, px, p.height);
                if (label) {
                    p.text(G.graphGlobals.fmtLabel(ux),
                           px+4, G.graphGlobals.ORIGIN_Y+17);
                }
            }
        };
    }

    function drawHorz(label) {
        return function (uy) {
            var py = G.graphGlobals.unitToPixel(G.makePoint(0,uy)).y();
            if (py < p.height && py > 0) {
                p.line(0, py, p.width, py);
                if (label) {
                    p.text(G.graphGlobals.fmtLabel(uy),
                           G.graphGlobals.ORIGIN_X+4, py-1);
                }
            }
        };
    }

    graphDude.display = function(functions) {
        drawGrid();
    };
    
    graphDude.snapToGridOn = function() {
        return $("#snapToGrid").prop("checked");
    };
    
    // SET UP PROCESSING
    p.setup = function () {
        p.size(G.graphGlobals.START_W, G.graphGlobals.START_H);
        G.graphGlobals.ORIGIN_X = p.width/2;
        G.graphGlobals.ORIGIN_Y = p.height/2;
        p.noLoop();
        p.textFont(p.loadFont("lib/font/Symbola.ttf"));
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
            //console.log(G.graphGlobals.SCALE);
            
            //console.log(event.wheelDeltaY);
            //if (event.wheelDeltaY > 0) {
            //    G.graphGlobals.SCROLL_SCALE += .5;
            //}
            //else {
            //    G.graphGlobals.SCROLL_SCALE -= .5;
            //}
            //G.graphGlobals.SCALE = G.graphGlobals.SCROLL_SCALE / 40.0;
            
            G.graphGlobals.SCALE *= 1.0 + G.graphGlobals.ZOOM *
                ((event.wheelDeltaY > 0) ? 1 : -1);
            
            // SCALE pixels per unit
            //G.graphGlobals.SCALE = ...
            
            
            //G.graphGlobals.SCROLL_SCALE += event.wheelDeltaY/10;
            //G.graphGlobals.SCROLL_SCALE = Math.floor((G.graphGlobals.SCROLL_SCALE*10))/10.0;
            //G.graphGlobals.SCROLL_SCALE = Math.floor(G.graphGlobals.SCROLL_SCALE);


            //G.graphGlobals.SCROLL_SCALE = Math.min(G.graphGlobals.SCROLL_SCALE, 10);
            //G.graphGlobals.SCROLL_SCALE = Math.max(G.graphGlobals.SCROLL_SCALE, -10);
            
            //G.graphGlobals.SCALE = G.graphGlobals.STARTING_UNIT * Math.pow(2, G.graphGlobals.SCROLL_SCALE);
            //console.log(G.graphGlobals.SCROLL_SCALE);

            graphDude.broadcast("dudeChanged", {action: "zoom"});
            event.preventDefault();
        }
    }
    return graphDude;
};

