// graph anchors
G.makeGraphRep = function(fun, p) {
    var rep = G.makeRepView(fun);
    
    var repData = fun.repData("graph");
    var selectedAnchor = null;
    
    rep.display = function() {
        p.stroke(fun.color.r, fun.color.g, fun.color.b);
        p.strokeWeight(fun.isSelected ? 2 : 1);

        var pixel1 = G.makePoint(0,0);
        var unit1 = G.graphGlobals.pixelToUnit(pixel1);
        unit1.y(fun.evaluate(unit1.x()));
        pixel1 = G.graphGlobals.unitToPixel(unit1);
        
        var unit2, pixel2;
        p.noFill();
        p.beginShape();
        while(pixel1.x() < p.width) {
            pixel2 = G.makePoint(pixel1.x() + G.graphGlobals.PIXEL_STEP, 0);
            unit2 = G.graphGlobals.pixelToUnit(pixel2);
            unit2.y(fun.evaluate(unit2.x()));
            pixel2 = G.graphGlobals.unitToPixel(unit2);
            
            p.vertex(pixel1.x(), pixel1.y());
            pixel1 = pixel2;
        }
        p.endShape();
        if (fun.isSelected) {
            for (a in repData) {
                repData[a].x && drawAnchor(repData[a]);
            }
        }
    };
    
    rep.select = function(mouseX, mouseY) {
        // select function
        var pixel1 = G.makePoint(0,0);
        var unit1 = G.graphGlobals.pixelToUnit(pixel1);
        unit1.y(fun.evaluate(unit1.x()));
        pixel1 = G.graphGlobals.unitToPixel(unit1);
                
        while(pixel1.x() < p.width) {
            if (p.dist(pixel1.x(), pixel1.y(), mouseX, mouseY) < G.graphGlobals.EPSILON) {
                rep.broadcast("selectFunction", {fun: rep.fun});
                return;
            }
            
            pixel1.x(pixel1.x() + G.graphGlobals.PIXEL_STEP);
            var unit1 = G.graphGlobals.pixelToUnit(pixel1);
            unit1.y(fun.evaluate(unit1.x()));
            pixel1 = G.graphGlobals.unitToPixel(unit1);
        }
    };
    
    rep.press = function(mouseX, mouseY) {
        // press anchor
        if (fun.isSelected) {
            for (a in repData) {
                var anchor = repData[a];
                if (anchor.x && p.dist(anchor.x(), anchor.y(), mouseX, mouseY) < G.graphGlobals.EPSILON) {
                    repData[a].isSelected = true;
                    return true;
                }
            }
        }
        return false;
    };
    
    rep.release = function() {
        selectedAnchor = null;
        for (a in repData) {
            repData[a].isSelected = false;
        }
    }
    
    rep.drag = function(mouseX, mouseY) {
        // drag anchor
        //console.log("before" + repData.rotate.x() + ", " + repData.rotate.y());
        for (a in repData) {
            if (repData[a].isSelected) {
                repData[a].x(mouseX);
                repData[a].y(mouseY);
                repData.changed = repData[a].name;
                rep.broadcast("repChanged", {fun: fun, repData: repData});
                return true;
            }
        }
        return false;
    };
    
    function drawAnchor(pt) {
        p.stroke(fun.color.r, fun.color.g, fun.color.b);
        p.fill(fun.color.r, fun.color.g, fun.color.b);
        p.ellipseMode(p.CENTER);
        p.ellipse(pt.x(), pt.y(), G.graphGlobals.ANCHOR_SIZE, G.graphGlobals.ANCHOR_SIZE);
    }
    
    return rep;
};