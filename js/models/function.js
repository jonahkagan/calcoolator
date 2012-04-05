G.makeFun = function(name, coefs) {
    var fun = {
        name: name,
        color: null // fix this
    };
    
    fun.reps = [];
    var graphRep = makeFunGraphRep();
    fun.reps.push(graphRep);

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
    
    function makeFunRep(name) {
        var rep = {
            name: name
        }
        
        rep.setRepFromCoefs = function(coefs) {
            throw "setRepFromCoefs not implemented!!";
        };
        
        // MUST RETURN NEW COEFS
        rep.getNewCoefsFromRep = function(spec) {
            throw "getNewCoefs not implemented!!";
        }
        
        return rep;
    }
    
    function makeFunGraphRep() {
        var rep = makeFunRep("graph");
        
        rep.setRepFromCoefs = function(coefs) {
            throw "setRepFromCoefs not implemented!!";
        };
        
        rep.getNewCoefsFromRep = function(spec) {
            var p1 = spec.translate;
            var p2 = spec.bend;
            var dx = p2.x() - p1.x();
            var p3 = makePoint({x: p1.x() - dx, y: spec.bend.y()});
            var M = $M([
                [p1.x()*p1.x(), p1.x(), 1],
                [p2.x()*p2.x(), p2.x(), 1],
                [p3.x()*p3.x(), p3.x(), 1]
            ])
            var V = $V([p1.y(), p2.y(), p3.y()])
            M = M.inv();
            var cfs = M.multiply(V).elements;
            return [cfs[2], cfs[1], cfs[0]];
        };
        
        return rep
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
