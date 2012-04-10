G.makeFun = function(name, coefs) {
    var fun = {
        name: name,
        coefs: coefs,
        color: G.color(Math.random()*255, Math.random()*255, Math.random()*255), // fix this
        isSelected: false
    };
    
    fun.degree = 1;
    for (var i = 0; i < coefs.length; i++) {
        if (fun.coefs[i] != 0)
            fun.degree = i;
    }

    fun.evaluate = function(x) {
        var fx = 0;
        if (fun.coefs) {
            for (var i = 0; i < fun.coefs.length; i++) {
                fx += fun.coefs[i] * Math.pow(x,i);
            }
        }
        //console.log("f(" + x + ") = " + fx);
        return fx;
    }
    
    var reps = {};
    var graphRep = G.makeFunGraphRep(fun);
    reps[graphRep.name] = graphRep;
    
    
    
    

    fun.getRepData = function(rep) {
        //console.log(reps[rep]);
        return reps[rep].data;

    };
    
    fun.repChanged = function(whichRep, repData) {
        fun.coefs = reps[whichRep].getNewCoefsFromRep(repData);

        // change all other reps
        if (fun.coefs) {
            for (r in reps) {
                if (reps[r].name !== whichRep) {
                    reps[r].setRepFromCoefs(coefs);
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
