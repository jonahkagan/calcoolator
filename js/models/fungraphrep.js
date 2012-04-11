G.makeFunGraphRep = function(fun) {
    var rep;

    if (fun.degree === 1) {
        rep = G.makeFunGraphRepD1(fun);
    }

    if (fun.degree === 2) {
        //var center = -1 * coefs[1] / (2*coefs[2]);
        //fun.anchors.translate = makeTranslateXYAnchor(fun, {ux:center, uy:fun.evaluate(center)});
        //fun.anchors.bend = makeBendAnchor(fun, {px: fun.anchors.translate.px() + p.width * .1, py: 0});
        //fun.anchors.bend.uy(fun.evaluate(fun.anchors.bend.ux()));
    }
    
    rep.setRepFromCoefs = function(coefs) {
        console.error("graph rep setRepFromCoefs not implemented!!");
        //throw "setRepFromCoefs not implemented!!";
    };

    // TODO: move to parabola rep
    function fitParabola(repData) {
        var p1 = repData.translate;
        var p2 = repData.bend;
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
    }
    
    return rep
}

G.makeFunGraphRepD1 = function(fun) {
    var rep = G.makeFunRep("graph", fun);
    
    rep.data.translate = (G.makeAnchor(G.graphGlobals.ORIGIN_X,G.graphGlobals.ORIGIN_Y,"translateY"));
    rep.data.rotate = (G.makeAnchor(G.graphGlobals.ORIGIN_X + G.graphGlobals.SCALE * 5,
                                      G.graphGlobals.ORIGIN_X - G.graphGlobals.SCALE * 5, "rotate"));
    
    rep.getNewCoefsFromRep = function(repData) {
        var coefs = [];

        if (repData.changed == 'rotate') {
            var unitRot = G.graphGlobals.pixelToUnit(repData.rotate);
            var unitTrans = G.graphGlobals.pixelToUnit(repData.translate);
            var slope = (unitRot.y() - unitTrans.y())/(unitRot.x() - unitTrans.x());
            coefs[0] = unitTrans.y();
            coefs[1] = slope;
        }
        
        if (repData.changed == 'translateY') {
            repData.translate.x(G.graphGlobals.ORIGIN_X); // fix to y-axis
            var dy = repData.translate.dy(); // dy in pixels
            repData.rotate.y(repData.rotate.y() + dy);
            var unitTrans = G.graphGlobals.pixelToUnit(repData.translate);
            coefs[0] = unitTrans.y();
            coefs[1] = fun.coefs[1];
        }
        
        return coefs;

    }
    return rep;
}

G.makeAnchor = function(x, y, name) {
    var _pt = G.makePoint(x, y);
    var _dx, _dy;
    
    var anchor = {
        name: name,
        x: _pt.x,
        y: _pt.y
    };
    
    anchor.x = function(x) {        
        if (x !== undefined) {
            _dx = x - anchor.x();
        }
        return _pt.x(x);
    };
    
    anchor.y = function(y) {
        if (y !== undefined) {
            _dy = y - anchor.y();
        }
        return _pt.y(y);
    };
    
    anchor.dx = function() {
        return _dx;
    };
    
    anchor.dy = function() {
        return _dy;
    };
    
    return anchor;
}
