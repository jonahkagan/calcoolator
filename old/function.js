G.makeFun = function(name, coefs, color) {
    var fun = {
        name: name,
        coefs: coefs,
        anchors: {},
        color: color
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
                fx += coefs[i] * Math.pow(x,i);
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


    fun.fitToPoints = function(anchors) {
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
    };

    return fun;
}

G.makePoint = function(x,y) {
    var pt = {_x: x, _y: y};
    
    pt.x = function(x) {
        if (x !== undefined) {
            _x = x;
        }
        return _x;
    }
    
    pt.y = function(y) {
        if (y !== undefined) {
            _y = y;
        }
        return _y;
    }
    
    return pt;
}
