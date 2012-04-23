G.makeFun = function(name, initCoefs) {
    var fun = {
        name: name,
        color: G.color(
            G.u.round(0, Math.random()*255),
            G.u.round(0, Math.random()*255),
            G.u.round(0, Math.random()*255)
        ), // fix this
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
    
    var reps = {};
    fun.repData = function (rep, data) {
        if (data !== undefined) {
            reps[rep] = data;
        }
        return reps[rep];
    };
    fun.coefs(initCoefs);

    fun.fitToPoints = function(pts) {
        var degree = pts.length - 1;
        var matrix = [];
        var vector = [];
        for (p in pts) {
            var point = pts[p];
            var row = [];
            for (var power = degree; power >= 0; power--) {
                row.push(Math.pow(point.x(), power));
            }
            vector.push(point.y());
            matrix.push(row);
        }
        var M = $M(matrix);
        var V = $V(vector);
        M = M.inv();
        var cfs = M.multiply(V).elements;
        return cfs.reverse();
    }

    return fun;
}

G.makePoint = function(x, y) {
    if (x === undefined || y === undefined) {
        return undefined;
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
    
    pt.toString = function () {
        return "(" + x + ", " + y + ")";
    };

    return pt;
}

G.makePoint.equals = function (pt1, pt2) {
    return pt1.x() === pt2.x() && pt1.y() === pt2.y();
};
    
