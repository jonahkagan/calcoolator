G.graphGlobals = {
    SCALE: 40, // -1, 0, 1, 2, ...
    SCROLL_SCALE: 0, // -40, 0, 40, 80, ...
    STARTING_UNIT: 40,
    MIN_SQUARE_SIZE: 40,
    MAX_SQUARE_SIZE: 80,
    PIXEL_STEP: 1,
    START_W: $(window).width(),
    START_H: $(window).height(),
    ANCHOR_SIZE: 10,
    ANCHOR_BUFFER: 20,
    EPSILON: 10,
    ORIGIN_X: 0,
    ORIGIN_Y: 0,
    
    pixelsPerUnit: function() {
        return G.graphGlobals.SCALE;
        //return G.graphGlobals.STARTING_UNIT*2.0^G.graphGlobals.SCALE;
    },
    
    pixelToUnit: function(pt) {
        var ppu = G.graphGlobals.pixelsPerUnit();
        var ux = (pt.x() - G.graphGlobals.ORIGIN_X) / ppu;
        var uy = -1 * (pt.y() - G.graphGlobals.ORIGIN_Y) / ppu;
        return G.makePoint(ux, uy);
    },

    unitToPixel: function(pt) {
        var ppu = G.graphGlobals.pixelsPerUnit();
        var px = (pt.x() * ppu) + G.graphGlobals.ORIGIN_X;
        var py = -1 * (pt.y() * ppu) + G.graphGlobals.ORIGIN_Y;
        return G.makePoint(px, py);
    },
    
    withinEdgeBuffer: function(pt) {
        var buff = G.graphGlobals.ANCHOR_BUFFER;
        var w = G.graphGlobals.START_W;
        var h = G.graphGlobals.START_H;
        return pt.x() > buff && pt.x() < w - buff && pt.y() > buff && pt.y() < h - buff;
    },
    
    snapToGridOn: function() {
        
    }
    
};