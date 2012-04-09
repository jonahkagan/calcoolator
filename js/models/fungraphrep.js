G.makeFunGraphRep = function(fun) {
    var rep = G.makeFunRep("graph", fun);

    if (fun.degree === 1) {
        rep.data.translate = G.makePoint(G.graphGlobals.ORIGIN_X,G.graphGlobals.ORIGIN_Y);
        rep.data.rotate = G.makePoint(G.graphGlobals.ORIGIN_X + G.graphGlobals.SCALE * 5,
                                      G.graphGlobals.ORIGIN_X - G.graphGlobals.SCALE * 5);
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
    
    rep.getNewCoefsFromRep = function(repData) {
        switch (fun.degree) {
            case 1:
                return fitLine(repData)
                break;
            case 2:
                return fitParabola(repData);
                break;
        }
        return fun.coefs;
    };
    
    function fitLine(repData) {
        var unitRot = G.graphGlobals.pixelToUnit(repData.rotate);
        var unitTrans = G.graphGlobals.pixelToUnit(repData.translate);
        var coefs = [];
        var slope = (unitRot.y() - unitTrans.y())/(unitRot.x() - unitTrans.x());
        coefs[0] = unitTrans.y();
        coefs[1] = slope;
        return coefs;
    }
    
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