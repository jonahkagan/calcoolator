G.makeGraphController = function(model, p) {
    var controller = G.makeController(model, "graph");
    var dude = G.makeGraphDude(p);
    var reps = [];
    var repHandler = G.makeRepHandler();
    var functions;
    var anchorSelected = false;
    
    dude.subscribe("newFunction", controller.onNewFunction);
    
    controller.onRepChanged = function(data) {
        // Update the function coefs here TODO
        // data.repData
        var coefs = repHandler.getNewCoefsFromRep(data.fun, data.repData);
        // fix anchors and stuff
        data.fun.repData("graph", data.repData);
        data.fun.coefs(coefs, "graph");
        model.changeFunction(data.fun, "graph");
    };
    
    controller.onDudeChange = function(event) {
        var selectedRepView;
        dude.display();
        if (functions) {
            reps = [];
            dude.display();
            for (f in functions) {
                var fun = functions[f];
                if (!fun.repData("graph") || fun.repData("graph").degree != fun.degree) {
                    // make new rep data
                    fun.repData("graph", repHandler.getRepFromCoefs(fun, fun.coefs()));
                }
                else {
                    if (event.action === "pan") {
                        var newRep = repHandler.translateRep(fun, fun.coefs(), fun.repData("graph"), event.dx, event.dy);
                        fun.repData("graph", newRep);
                    }
                    else if (event.action === "zoom") {
                        fun.repData("graph", repHandler.modifyRep(fun, fun.coefs(), fun.repData("graph")));
                    }
                }
                var repView = G.makeGraphRep(fun, p);
                repView.subscribe("selectFunction", controller.onSelectFunction);
                repView.subscribe("repChanged", controller.onRepChanged);
                if (fun.isSelected) {
                    selectedRepView = repView;
                } else {
                    repView.display();
                }
                reps.push(repView);
            }
            selectedRepView.display();
        }
    };
    
    controller.onUpdate = function(data) {
        var selectedRepView;
        // Update whichever function changed if the event src wasn't
        // "graph" TODO
        //console.log("updating views!");
        if (data && data.functions) {
            functions = data.functions;
        }
        if (functions) {
            reps = [];
            dude.display();
            for (f in functions) {
                var fun = functions[f];
                if (!fun.repData("graph") || fun.repData("graph").degree != fun.degree) {
                    // make new rep data
                    fun.repData("graph", repHandler.getRepFromCoefs(fun, fun.coefs()));
                }
                else if (data.src !== "graph") {
                    fun.repData("graph", repHandler.modifyRep(fun, fun.coefs(), fun.repData("graph")));
                }
                var repView = G.makeGraphRep(fun, p);
                repView.subscribe("selectFunction", controller.onSelectFunction);
                repView.subscribe("repChanged", controller.onRepChanged);
                if (fun.isSelected) {
                    selectedRepView = repView;
                } else {
                    repView.display();
                }
                reps.push(repView);
            }
            selectedRepView.display();
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
        if (!anchorSelected) {
            G.graphGlobals.ORIGIN_X += data.dx;
            G.graphGlobals.ORIGIN_Y += data.dy;
            data["action"] = "pan";
            controller.onDudeChange(data);
        }
        else if (data.mouseX && data.mouseY) {
            var snap = dude.snapToGridOn();
            for (r in reps) {
                reps[r].drag(data.mouseX, data.mouseY, snap);
            }
        }
    }
    
    controller.onPress = function(data) {
        //select anchor
        if (data.mouseX && data.mouseY) {
            for (r in reps) {
                if (reps[r].press(data.mouseX, data.mouseY)) {
                    anchorSelected = true;
                    return;
                }
            }
        }
        anchorSelected = false;
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
    dude.subscribe("dudeChanged", controller.onDudeChange);
    
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
    
    /*
     usually fixes translate anchor and slides other anchor to move
     minimally
     to be implemented by rep handlers
    */
    handler.modifyRep = function(fun, coefs, repData) {
        if (handlers[fun.degree]) {
            return handlers[fun.degree].modifyRep(fun, coefs, repData);
        }
        return null;
    };
     
    /*
     translates anchors. if anchor is translated off screen, modifies
    */
    handler.translateRep = function(fun, coefs, repData, dx, dy) {
        for (a in repData) {
            var rep = repData[a];
            if (rep.x) { // is an anchor
                rep.x(rep.x() + dx);
                rep.y(rep.y() + dy);
                if (!G.graphGlobals.withinEdgeBuffer(rep)) {
                    return handler.modifyRep(fun, coefs, repData);
                }
            }
        }
        return repData;
    };
    
    return handler;
}

G.makeRepHandlerD1 = function() {
    var handler = {};
    
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
            coefs[1] = fun.coefs()[1];
        }
        
        return coefs;
    }
    
    handler.getRepFromCoefs = function(fun, coefs) {
        var repData = {};
        var unitTrans = G.makePoint(0, coefs[0]);
        var pixelTrans = G.graphGlobals.unitToPixel(unitTrans);
        repData.translate = G.makeAnchor(pixelTrans.x(), pixelTrans.y(), 'translate');
        var unitRot = G.makePoint(4, fun.evaluate(4));
        var pixelRot = G.graphGlobals.unitToPixel(unitRot);
        repData.rotate = G.makeAnchor(pixelRot.x(), pixelRot.y(), 'rotate');
        repData.degree = 1;
        return repData;
    };
    

    handler.modifyRep = function(fun, coefs, repData) {
        // fix translate anchor to function
        var unitTrans = G.makePoint(0, coefs[0]);
        var pixelTrans = G.graphGlobals.unitToPixel(unitTrans);
        repData.translate = G.makeAnchor(pixelTrans.x(), pixelTrans.y(), 'translate');
        
        // slide rotate anchor to be as pixelly close as possible to old rot anchor
        
        var pixel1 = G.makePoint(0,0);
        var unit1 = G.graphGlobals.pixelToUnit(pixel1);
        unit1.y(fun.evaluate(unit1.x()));
        pixel1 = G.graphGlobals.unitToPixel(unit1);
        var oldRot = repData.rotate;
        var closestPixel = pixel1;
        var minDist = G.dist(pixel1.x(), pixel1.y(), oldRot.x(), oldRot.y());
        
        while(pixel1.x() < G.graphGlobals.START_W) {
            var dist = G.dist(pixel1.x(), pixel1.y(), oldRot.x(), oldRot.y());
            var distToTrans = G.dist(pixel1.x(), pixel1.y(), pixelTrans.x(), pixelTrans.y());
            if (dist < minDist && distToTrans > G.graphGlobals.ANCHOR_BUFFER
                    && G.graphGlobals.withinEdgeBuffer(pixel1)) {
                minDist = dist;
                closestPixel = pixel1;
            }
            
            pixel1.x(pixel1.x() + G.graphGlobals.PIXEL_STEP);
            var unit1 = G.graphGlobals.pixelToUnit(pixel1);
            unit1.y(fun.evaluate(unit1.x()));
            pixel1 = G.graphGlobals.unitToPixel(unit1);
        }
        repData.rotate = G.makeAnchor(closestPixel.x(), closestPixel.y(), "rotate");

        return repData;
    };
    

    
    return handler;
}

G.makeRepHandlerD2 = function(fun) {
    var handler = {};

    handler.getNewCoefsFromRep = function(fun, repData) {
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
    
    handler.getRepFromCoefs = function(fun, coefs) {
        console.log('setting coefs');
        var repData = {};
        var center = -1 * coefs[1] / (2*coefs[2]);
        var unitTrans = G.makePoint(center, fun.evaluate(center));
        var pixelTrans = G.graphGlobals.unitToPixel(unitTrans);
        var unitBend = G.makePoint(center + 2, fun.evaluate(center + 2));
    
        var pixelBend = G.graphGlobals.unitToPixel(unitBend);
        repData.translate = G.makeAnchor(pixelTrans.x(), pixelTrans.y(), "translate");
        repData.bend = G.makeAnchor(pixelBend.x(), pixelBend.y(), "bend");
        repData.degree = 2;
        return repData;
    };

    handler.modifyRep = function(fun, coefs, repData) {
        // fix translate anchor to function
        var center = -1 * coefs[1] / (2*coefs[2]);
        var unitTrans = G.makePoint(center, fun.evaluate(center));
        var pixelTrans = G.graphGlobals.unitToPixel(unitTrans);
        repData.translate = G.makeAnchor(pixelTrans.x(), pixelTrans.y(), "translate");

        // slide rotate anchor to be as pixelly close as possible to old rot anchor
        
        var pixel1 = G.makePoint(0,0);
        var unit1 = G.graphGlobals.pixelToUnit(pixel1);
        unit1.y(fun.evaluate(unit1.x()));
        pixel1 = G.graphGlobals.unitToPixel(unit1);
        var oldBend = repData.bend;
        var closestPixel = pixel1;
        var minDist = G.dist(pixel1.x(), pixel1.y(), oldBend.x(), oldBend.y());
        
        while(pixel1.x() < G.graphGlobals.START_W) {
            var dist = G.dist(pixel1.x(), pixel1.y(), oldBend.x(), oldBend.y());
            var distToTrans = G.dist(pixel1.x(), pixel1.y(), pixelTrans.x(), pixelTrans.y());
            if (dist < minDist && distToTrans > G.graphGlobals.ANCHOR_BUFFER
                    && G.graphGlobals.withinEdgeBuffer(pixel1)) {
                minDist = dist;
                closestPixel = pixel1;
            }
            
            pixel1.x(pixel1.x() + G.graphGlobals.PIXEL_STEP);
            var unit1 = G.graphGlobals.pixelToUnit(pixel1);
            unit1.y(fun.evaluate(unit1.x()));
            pixel1 = G.graphGlobals.unitToPixel(unit1);
        }
        repData.bend = G.makeAnchor(closestPixel.x(), closestPixel.y(), "rotate");

        return repData;
    };

    return handler;
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
