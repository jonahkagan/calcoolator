G.makeFun = function(name, initCoefs) {
    var fun = {
        name: name,
        color: G.color(Math.random()*255, Math.random()*255, Math.random()*255), // fix this
        isSelected: false
    };
    var coefs;
    
    fun.evaluate = function(x) {
        if (coefs) {
            var fx = 0;
            for (var i = 0; i < coefs.length; i++) {
                fx += coefs[i] * Math.pow(x,i);
            }
            return fx;
        }
        //console.log("f(" + x + ") = " + fx);
        return null;
    };

    fun.coefs = function (newCoefs) {
        if (newCoefs !== undefined) {
            coefs = _.clone(newCoefs);
            if (coefs) {
                fun.degree = 1;
                for (var i = 0; i < coefs.length; i++) {
                    if (coefs[i] != 0)
                        fun.degree = i;
                }
            } else {
                fun.degree = null;
            }
        }
        return coefs;
    };
    fun.coefs(initCoefs);
    
    var reps = {};
    fun.repData = function (rep, data) {
        if (data !== undefined) {
            reps[rep] = data;
        }
        return reps[rep];
    };

    return fun;
}

G.makePoint = function(x, y) {
    if (x === undefined || y === undefined) {
        throw "cannot make point with undefined x,y";
    }
    
    var pt = {};
    var _x = x;
    var _y = y;
    
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
