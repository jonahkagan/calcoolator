function drawGraph(p) {
    var UNIT = 20,
        START_W = 600,
        START_H = 600,
        originX, originY;
    

    p.setup = function () {
        p.size(START_W, START_H);
        originX = p.width/2;
        originY = p.height/2;
    };

    p.draw = function () {
        drawGrid();
         
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
            color: "#FF0000"
        };

        fun.draw = function() {
            for (var x = 0; x <= p.width; x += UNIT) {
            }

        };

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

        if (_ux && _uy) {
            _calc('px');
            _calc('py');
        } else if (_px && _py) {
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

        var _calc = function (prop) {
            calcFuns[prop]();
        }

        pt.ux = function (ux) {
            if (ux) {
                _ux = ux;
                _calc('px');
            }
            return _ux;
        };



        return pt;
    }

    function die(msg, obj) {}

};





