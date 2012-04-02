G.makeFun = function(name, coefs) {
    var fun = {
        name: name,
        coefs: coefs,
        anchors: {},
        color: null // fix this
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
