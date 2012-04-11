G.makeFunGraphRep = function(fun) {
    var rep;

    if (fun.degree === 1) {
        rep = G.makeFunGraphRepD1(fun);
    }

    else if (fun.degree === 2) {
        rep = G.makeFunGraphRepD2(fun);
    }
    
    else {
        rep = G.makeFunRep("graph", fun);
    }
    
    rep.setRepFromCoefs = function(coefs) {
        console.error("graph rep setRepFromCoefs not implemented!!");
        //throw "setRepFromCoefs not implemented!!";
    };
    
    return rep
}

G.makeFunGraphRepD1 = function(fun) {
    var rep = G.makeFunRep("graph", fun);
    
    rep.data.translate = G.makeAnchor(G.graphGlobals.ORIGIN_X,G.graphGlobals.ORIGIN_Y,"translate");
    rep.data.rotate = G.makeAnchor(G.graphGlobals.ORIGIN_X + G.graphGlobals.SCALE * 5,
                                      G.graphGlobals.ORIGIN_X - G.graphGlobals.SCALE * 5, "rotate");
    
    rep.getNewCoefsFromRep = function(repData) {
        var coefs = [];

        if (repData.changed == 'rotate') {
            var unitRot = G.graphGlobals.pixelToUnit(repData.rotate);
            var unitTrans = G.graphGlobals.pixelToUnit(repData.translate);
            var slope = (unitRot.y() - unitTrans.y())/(unitRot.x() - unitTrans.x());
            coefs[0] = unitTrans.y();
            coefs[1] = slope;
        }
        
        if (repData.changed == 'translate') {
            repData.translate.x(G.graphGlobals.ORIGIN_X); // fix to y-axis
            var dy = repData.translate.dy(); // dy in pixels
            repData.rotate.y(repData.rotate.y() + dy);
            var unitTrans = G.graphGlobals.pixelToUnit(repData.translate);
            coefs[0] = unitTrans.y();
            coefs[1] = fun.coefs[1];
        }
        
        return coefs;
    }
    
    rep.setRepFromCoefs = function(coefs) {
        var unitTrans = G.makePoint(0, coefs[0]);
        var pixelTrans = G.graphGlobals.unitToPixel(unitTrans);
        repData.translate = G.makeAnchor(pixelTrans.x(), pixelTrans.y(), 'translate');
        var unitRot = G.makePoint(2, fun.evaluate(2));
        var slope = (unitRot.y() - unitTrans.y())/(unitRot.x() - unitTrans.x());
        coefs[0] = unitTrans.y();
        coefs[1] = slope;
    };
    
    return rep;
}

G.makeFunGraphRepD2 = function(fun) {
    var rep = G.makeFunRep("graph", fun);

    rep.getNewCoefsFromRep = function(repData) {
        var coefs = [];

        if (repData.changed == 'translate') {
            var dx = repData.translate.dx();
            var dy = repData.translate.dy(); // dy in pixels
            repData.bend.x(repData.bend.x() + dx);
            repData.bend.y(repData.bend.y() + dy);
        }
        
        if (repData.changed == 'bend') {
            // nothing?
        }
        
        var unitTrans = G.graphGlobals.pixelToUnit(repData.translate);
        var unitBend = G.graphGlobals.pixelToUnit(repData.bend);
        var dx = unitBend.x() - unitTrans.x();
        var mirroredBend = G.makePoint(unitTrans.x() - dx, unitBend.y());
        
        return fun.fitToPoints([unitTrans, unitBend, mirroredBend]);
    }
    
    rep.setRepFromCoefs = function(coefs) {
        console.log('setting coefs');
        var center = -1 * coefs[1] / (2*coefs[2]);
        var unitTrans = G.makePoint(center, fun.evaluate(center));
        var pixelTrans = G.graphGlobals.unitToPixel(unitTrans);
        var unitBend = G.makePoint(center + 2, fun.evaluate(center + 2));
    
        var pixelBend = G.graphGlobals.unitToPixel(unitBend);
        rep.data.translate = G.makeAnchor(pixelTrans.x(), pixelTrans.y(), "translate");
        rep.data.bend = G.makeAnchor(pixelBend.x(), pixelBend.y(), "bend");
    };
    
    rep.setRepFromCoefs(fun.coefs);
    
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
