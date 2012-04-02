G = {};

G.makeGraph = function(p, m) {
    var UNIT = 20,
    STEP = 1,
    START_W = 600,
    START_H = 600,
    ANCHOR_SIZE = 10,
    EPSILON = 10,
    originX, originY;

    var graph = {};
    
    p.setup = function () {
        p.size(START_W, START_H);
        originX = p.width/2;
        originY = p.height/2;
        p.smooth();

        graph.draw(m.functions);
    };

    p.draw = function () { };
    
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
    
        
    function selectFunction() {
        for (f in m.functions) {
            if (graph.isClicked(m.functions[f])) {
                m.selectedFunction = m.functions[f];
                G.writeTemporaryInput();
            }
        }
        graph.draw();
    }

    function drawFunction(fun) {
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
    
    
    function isClicked(fun) {
        var pt = makePoint({px:0, py:0});
        pt.uy(fun.evaluate(pt.ux()));
        while(pt.px() < p.width) {
            if (p.dist(pt.px(), pt.py(), p.mouseX, p.mouseY) < EPSILON) {
                return true;
            }
            pt.px(pt.px() + STEP);
            pt.uy(fun.evaluate(pt.ux()));
        }
        return false;
    }

    
    function mousePressed(fun) {
        currAnchor = null;
        for (var a in fun.anchors) {
            if (fun.anchors[a].isPressed()) {
                currAnchor = fun.anchors[a];
            }
        }
    }

    function mouseDragged(fun) {
        currAnchor && currAnchor.onDrag();
        drawStuff(); 
    }

    function mouseReleased(fun) {

    }
    
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
    
    
    graph.draw = function() {
        drawGrid();
        for (f in m.functions) {
            drawFunction(m.functions[f]);
        }
    }
    
    
    /*  spec: {
        ux: x coord in units
        uy: ...
        px: x coord in pixels
        py: ...
    }
    ux/uy has precedence
    */
    function makePoint(spec) {
        var pt = {};
    
        var _ux = spec.ux,
            _uy = spec.uy,
            _px = spec.px,
            _py = spec.py;
    
        if (_ux !== undefined && _uy !== undefined) {
            _calc('px');
            _calc('py');
        } else if (_px !== undefined && _py !== undefined) {
            _calc('ux');
            _calc('uy');
        } else {
            die('Bad pt spec', spec);
        }
    
        function _calc(prop) {
            switch (prop) {
                case 'ux':
                    _ux = (_px - originX) / UNIT;
                    break;
                case 'uy':
                    _uy = -1 * (_py - originY) / UNIT;
                    break;
                case 'px':
                    _px = (_ux * UNIT) + originX;
                    break;
                case 'py':
                    _py = -1 * (_uy * UNIT) + originY;
                    break;
                default: die('Bad prop in _calc', prop);
            }
        }
    
        pt.ux = function (ux) {
            if (ux !== undefined) {
                _ux = ux;
                _calc('px');
            }
            return _ux;
        };
    
        pt.uy = function (uy) {
            if (uy !== undefined) {
                _uy = uy;
                _calc('py');
            }
            return _uy;
        };
    
        pt.px = function (px) {
            if (px !== undefined) {
                _px = px;
                _calc('ux');
            }
            return _px;
        }
    
        pt.py = function (py) {
            if (py !== undefined) {
                _py = py;
                _calc('uy');
            }
            return _py;
        }
    
        return pt;
    }
    
    
    
    function makeAnchor(fun, spec) {
        var anchor = makePoint(spec);
        anchor.fun = fun;
        
        anchor.draw = function() {
            p.stroke(anchor.fun.color);
            p.fill(anchor.fun.color);
            p.ellipseMode(p.CENTER);
            p.ellipse(anchor.px(), anchor.py(), ANCHOR_SIZE, ANCHOR_SIZE);
        }
        
        anchor.isPressed = function() {
            return p.dist(anchor.px(), anchor.py(), p.mouseX, p.mouseY) < EPSILON;
        };
        
        anchor.onDrag = function() {};
        
        return anchor
    }
    
    graph.addFunction = function(fun) {
        if (fun.degree === 1) {
            fun.anchors.translate = makeTranslateYAnchor(fun, {ux:0, uy:fun.evaluate(0)});
            fun.anchors.rotate = makeRotateAnchor(fun, {px: originX + p.width * .1, py: 0});
            fun.anchors.rotate.uy(fun.evaluate(fun.anchors.rotate.ux()));
        }
        if (fun.degree == 2) {
            var center = -1 * coefs[1] / (2*coefs[2]);
            fun.anchors.translate = makeTranslateXYAnchor(fun, {ux:center, uy:fun.evaluate(center)});
            fun.anchors.bend = makeBendAnchor(fun, {px: fun.anchors.translate.px() + p.width * .1, py: 0});
            fun.anchors.bend.uy(fun.evaluate(fun.anchors.bend.ux()));
            //fit to anchors?
        }  
    };
    
    function makeTranslateYAnchor(fun, spec) {
        if (fun.degree != 1) {
            die("cannot make translateY anchor for degree not equal to one", fun);
        }
        var anchor = makeAnchor(fun, spec);
        anchor.onDrag = function() {
            var dy = p.mouseY - anchor.py();
            for (a in anchor.fun.anchors) {
                anchor.fun.anchors[a].py(anchor.fun.anchors[a].py() + dy);
            }
            anchor.fun.coefs[0] = anchor.uy();
            writeTemporaryInput();
        }
        return anchor;
    }
    
    function makeRotateAnchor(fun, spec) {
        if (fun.degree != 1) {
            die("cannot make rotate anchor for degree not equal to one", fun);
        }
        var rotate = makeAnchor(fun, spec);
        rotate.onDrag = function() {
            rotate.py(p.mouseY);
            rotate.px(p.mouseX);
            translate = fun.anchors.translate;
            var slope = (rotate.uy() - translate.uy())/(rotate.ux() - translate.ux());
            rotate.fun.coefs[1] = slope;
            writeTemporaryInput();
        }
        return rotate;
    }
    
    function makeTranslateXYAnchor(fun, spec) {
        if (fun.degree != 2) {
            die("cannot make translateXY anchor for degree not equal to one", fun);
        }
        var anchor = makeAnchor(fun, spec);
        anchor.onDrag = function() {
            var dy = p.mouseY - anchor.py();
            var dx = p.mouseX - anchor.px();
            for (a in anchor.fun.anchors) {
                anchor.fun.anchors[a].py(anchor.fun.anchors[a].py() + dy);
                anchor.fun.anchors[a].px(anchor.fun.anchors[a].px() + dx);
            }
            fun.fitToAnchors();
        }
        return anchor;
    }
    
    function makeBendAnchor(fun, spec) {
        if (fun.degree != 2) {
            die("cannot make bend anchor for degree not equal to 2", fun);
        }
        var bend = makeAnchor(fun, spec);
        bend.onDrag = function() {
            bend.py(p.mouseY);
            bend.px(p.mouseX);
            fun.fitToAnchors();
        }
        return bend;
    }

    
    return graph;
}

