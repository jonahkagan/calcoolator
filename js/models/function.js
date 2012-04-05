G.makeFun = function(name, coefs) {
    var fun = {
        name: name,
        color: G.color(255, 0, 0), // fix this
        isSelected: false
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
    
    fun.reps = [];
    var graphRep = G.makeFunGraphRep(fun);
    fun.reps.push(graphRep);

    fun.getRepData = function(rep) {
        console.log("getRepData called");
        for (r in fun.reps) {
            if (fun.reps[r].name === rep) {
                var data = fun.reps[r].data;
                return data;
            }
        }
        return null;
    };
    
    fun.repChanged = function(rep, spec) {
        var coefs;
        for (r in fun.reps) {
            if (fun.reps[r].name === rep) {
                coefs = fun.reps[r].getNewCoefsFromSpec();
            }
        }
        // change all other reps
        if (coefs) {
            for (r in fun.reps) {
                if (fun.reps[r].name !== rep) {
                    fun.reps[r].setRepFromCoefs(coefs);
                }
            }
        }
    }

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
