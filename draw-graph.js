TEST = {};
function drawGraph(p) {
    var UNIT = 20,
        STEP = 1,
        START_W = 600,
        START_H = 600,
        ANCHOR_SIZE = 10,
        EPSILON = 10,
        originX, originY,
        functions = [],
        selectedFunction,
        funAnchors,
        currAnchor,
        parser = makeParser(),
        eqnInput;

    p.setup = function () {
        p.size(START_W, START_H);
        originX = p.width/2;
        originY = p.height/2;
        eqnInput = document.getElementById('eqn');
        console.log(eqnInput);
        eqnInput.onchange = readTemporaryInput;
        /*
        i0 = document.getElementById("zero");
        i1 = document.getElementById("one");
        i2 = document.getElementById("two");
        i0.onchange = readTemporaryInput;
        i1.onchange = readTemporaryInput;
        i2.onchange = readTemporaryInput;
        */
        readTemporaryInput();
        p.smooth();
        drawStuff();
    };

    p.draw = function () { };

    drawStuff = function() {
        drawGrid();
        for (f in functions) {
            functions[f].draw();
        }
    }
    
    p.mouseClicked = function() {
        selectFunction();
    }

    p.mousePressed = function() {
        selectedFunction.mousePressed();
    }

    p.mouseDragged = function() {
        selectedFunction.mouseDragged();
    }

    p.mouseReleased = function() {
        selectedFunction.mouseReleased();
    }
    
    function readTemporaryInput() {
        //selectedFunction = makeFun("f", [i0.value, i1.value, i2.value]);
        var coefs = parser.parseAndSimplify(eqnInput.value);
        if (coefs && coefs.length) { // TODO find better way to check for array
            selectedFunction = makeFun('f', coefs);
            functions.push(selectedFunction);
            drawStuff();
        }
    }
    
    function writeTemporaryInput() {
        /*
        i0.value = selectedFunction.coefs[0];
        i1.value = selectedFunction.coefs[1];
        i2.value = selectedFunction.coefs[2];
        */
        eqnInput.value = selectedFunction.toEqnString();
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
    
    function getNextFunctionColor() {
        // replace with something smart, k?
        return p.color(p.random(255), p.random(255), p.random(255));
    }
    
    function selectFunction() {
        for (f in functions) {
            if (functions[f].isClicked()) {
                selectedFunction = functions[f];
                writeTemporaryInput();
            }
        }
        drawStuff();
    }

    // A function has
    // - coefficient list
    // - name
    // - color
    // - points/table
    
    function makeFun(name, coefs) {
        var fun = {
            name: name,
            coefs: coefs,
            anchors: {},
            color: getNextFunctionColor()
        };

        fun.degree = 1;
        for (var i = 0; i < coefs.length; i++) {
            if (coefs[i] != 0)
                fun.degree = i;
        }

        fun.evaluate = function(x) {
            var fx = 0;
            if (coefs) {
                for (var i = 0; i < coefs.length; i++) {
                    fx += coefs[i] * p.pow(x,i);
                }
            }
            //console.log("f(" + x + ") = " + fx);
            return fx;
        }

        function round(num, places) {
            var digits = num.toFixed(places).split();
            while (digits[digits.length] === '0') {
                digits.pop();
            }
            return parseFloat(digits.join());
        }

        fun.toEqnString = function () {
            var eqnStr = '';
            if (coefs) {
                for (var i = coefs.length-1; i >= 0; i--) {
                    var coef = round(coefs[i], 2);
                    if (coef !== 0) {
                        eqnStr += coef;
                        if (i > 0) {
                            eqnStr += '*x^' + i + ' + ';
                        }
                    }
                }
                if (eqnStr.charAt(eqnStr.length - 2) === '+') {
                    eqnStr = eqnStr.substring(0, eqnStr.length - 3);
                }
            }
            return eqnStr;
        };

        fun.draw = function() {
            p.stroke(fun.color);
            p.strokeWeight(fun == selectedFunction ? 2 : 1);
            var p1 = makePoint({px:0, py:0});
            var p2;
            p1.uy(fun.evaluate(p1.ux()));
            
            while(p1.px() < p.width) {
                p2 = makePoint({px:p1.px() + STEP, py:0});
                p2.uy(fun.evaluate(p2.ux()));
                p.line(p1.px(), p1.py(), p2.px(), p2.py());
                p1 = p2;
            }

            if (fun == selectedFunction) {
                for (var a in fun.anchors) {
                    fun.anchors[a].draw();
                }
            }
        };
        
        fun.isClicked = function() {
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
            
            fun.fitToAnchors = function() {
                var p1 = fun.anchors.translate;
                var p2 = fun.anchors.bend;
                var dx = p2.ux() - p1.ux();
                var p3 = makePoint({ux: p1.ux() - dx, uy: fun.anchors.bend.uy()});
                var M = $M([
                    [p1.ux()*p1.ux(), p1.ux(), 1],
                    [p2.ux()*p2.ux(), p2.ux(), 1],
                    [p3.ux()*p3.ux(), p3.ux(), 1]
                ])
                var V = $V([p1.uy(), p2.uy(), p3.uy()])
                M = M.inv();
                var cfs = M.multiply(V).elements;
                fun.coefs[0] = cfs[2];
                fun.coefs[1] = cfs[1];
                fun.coefs[2] = cfs[0];
                writeTemporaryInput();
            }
        }

        fun.mousePressed = function() {
            currAnchor = null;
            for (var a in fun.anchors) {
                if (fun.anchors[a].isPressed()) {
                    currAnchor = fun.anchors[a];
                }
            }
        }

        fun.mouseDragged = function() {
            currAnchor && currAnchor.onDrag();
            drawStuff(); 
        }

        fun.mouseReleased = function() {

        }
        return fun;
    }

    // spec: {
    //  ux: x coord in units
    //  uy: ...
    //  px: x coord in pixels
    //  py: ...
    // }
    // ux/uy has precedence
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

    function die(msg, obj) { console.log(msg); }

    TEST.makePoint = makePoint;
    TEST.makeFun = makeFun;

};





