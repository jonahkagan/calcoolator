G.makeGraphController = function(model, p) {
    var controller = G.makeController(model, "graph");
    var dude = G.makeGraphDude(p);
    var reps = [];
    var repHandler = G.makeRepHandler();
    
    dude.subscribe("newFunction", controller.onNewFunction);
    
    controller.onRepChanged = function(data) {
        // Update the function coefs here TODO
        // data.repData
        console.log(data);
        var coefs = repHandler.getNewCoefsFromRep(data.fun, data.repData);
        // fix anchors and stuff
        data.fun.repData("graph", data.repData);
        data.fun.coefs(coefs);
        model.changeFunction(data.fun, "graph");
    }
    
    controller.onUpdate = function(data) {
        // Update whichever function changed if the event src wasn't
        // "graph" TODO
        //console.log("updating views!");
        if (data && data.functions) {
            reps = [];
            dude.display();
            for (f in data.functions) {
                var fun = data.functions[f];
                if (!fun.repData()) {
                    // make new rep data
                    fun.repData("graph", repHandler.getRepFromCoefs(fun, fun.coefs()));
                }
                var repView = G.makeGraphRep(fun, p);
                repView.subscribe("selectFunction", controller.onSelectFunction);
                repView.subscribe("repChanged", controller.onRepChanged);
                repView.display();
                reps.push(repView);
            }
        }
    }
    
    controller.onClick = function(data) {
        //select function
        model.selectFunction(null);
        if (data.mouseX && data.mouseY) {
            for (r in reps) {
                reps[r].select(data.mouseX, data.mouseY);
            }
        }
    }
    
    controller.onDrag = function(data) {
        //move anchor
        if (data.mouseX && data.mouseY) {
            for (r in reps) {
                reps[r].drag(data.mouseX, data.mouseY);
            }
        }
    }
    
    controller.onPress = function(data) {
        //select anchor
        if (data.mouseX && data.mouseY) {
            for (r in reps) {
                reps[r].press(data.mouseX, data.mouseY);
            }
        }
    }
    
    controller.onRelease = function(data) {
        for (r in reps) {
            reps[r].release();
        }
    }
    
    dude.subscribe("mouseClicked", controller.onClick);
    dude.subscribe("mouseDragged", controller.onDrag);
    dude.subscribe("mousePressed", controller.onPress);
    dude.subscribe("mouseReleased", controller.onRelease);

    return controller;
};


G.makeRepHandler = function() {
    var handler = {};
    var handlers = [null, G.makeRepHandlerD1(), G.makeRepHandlerD2()];
    
    handler.getNewCoefsFromRep = function(fun, repData) {
        if (handlers[fun.degree]) {
            return handlers[fun.degree].getNewCoefsFromRep(fun, repData);
        }
        return null;
    };

    handler.getRepFromCoefs = function(fun, coefs) {
        if (handlers[fun.degree]) {
            return handlers[fun.degree].getRepFromCoefs(fun, coefs);
        }
        return null;
    };

    return handler;
}

G.makeRepHandlerD1 = function() {
    var handler = {};
    /*
    rep.data.translate = G.makeAnchor(G.graphGlobals.ORIGIN_X,G.graphGlobals.ORIGIN_Y,"translate");
    rep.data.rotate = G.makeAnchor(G.graphGlobals.ORIGIN_X + G.graphGlobals.SCALE * 5,
                                      G.graphGlobals.ORIGIN_X - G.graphGlobals.SCALE * 5, "rotate");
    */
    handler.getNewCoefsFromRep = function(fun, repData) {
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
    
    handler.getRepFromCoefs = function(fun, coefs) {
        var repData = {};
        var unitTrans = G.makePoint(0, coefs[0]);
        var pixelTrans = G.graphGlobals.unitToPixel(unitTrans);
        repData.translate = G.makeAnchor(pixelTrans.x(), pixelTrans.y(), 'translate');
        var unitRot = G.makePoint(2, fun.evaluate(2));
        repData.rotate = G.graphGlobals.unitToPixel(unitRot);
        return repData;
    };
    
    return handler;
}

G.makeRepHandlerD2 = function(fun) {
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
    
    //rep.setRepFromCoefs(fun.coefs);
    
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
