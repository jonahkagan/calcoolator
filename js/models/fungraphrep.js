G.makeFunGraphRep = function(fun) {
    var rep = G.makeFunRep("graph", fun);

    if (fun.degree === 1) {
        rep.data.translate = G.makePoint(G.graphGlobals.ORIGIN_X,G.graphGlobals.ORIGIN_Y);
        rep.data.rotate = G.makePoint(300, 0);
//        rep.repData.rotate = G.makePoint(originX + p.width * .1, 0);
    }

    if (fun.degree === 2) {
        //var center = -1 * coefs[1] / (2*coefs[2]);
        //fun.anchors.translate = makeTranslateXYAnchor(fun, {ux:center, uy:fun.evaluate(center)});
        //fun.anchors.bend = makeBendAnchor(fun, {px: fun.anchors.translate.px() + p.width * .1, py: 0});
        //fun.anchors.bend.uy(fun.evaluate(fun.anchors.bend.ux()));
    }
    
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