TEST = {};
function drawGraph(p) {
    var UNIT = 20,
        STEP = 2,
        START_W = 600,
        START_H = 600,
        originX, originY,
        currentFunction;    

    p.setup = function () {
        p.size(START_W, START_H);
        originX = p.width/2;
        originY = p.height/2;
        currentFunction = makeFun("f", [0,1,1,4,2]);
        drawGrid();
        currentFunction.draw(); 
    };

    p.draw = function () {
    };

    function drawGrid() {
        p.background(250);

        // Gridlines
        p.stroke(230);
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

    // A function has
    // - coefficient list
    // - name
    // - color
    // - points/table
    
    function makeFun(name, coefs) {
        var fun = {
            name: name,
            coefs: coefs,
            color: p.color(255,0,0)
        };

        fun.draw = function() {
            p.stroke(fun.color);
            var p1 = makePoint({px:0, py:0});
            var p2;
            p1.uy(fun.evaluate(p1.ux()));
            
            while(p1.px() < p.width) {
                p2 = makePoint({px:p1.px() + STEP, py:0});
                p2.uy(fun.evaluate(p2.ux()));
                p.line(p1.px(), p1.py(), p2.px(), p2.py());
                p1 = p2;
            }
        };

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

    function die(msg, obj) { console.log(msg); }

    TEST.makePoint = makePoint;
    TEST.makeFun = makeFun;

};





