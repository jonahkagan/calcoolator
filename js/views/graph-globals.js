G.graphGlobals = {
    SCALE: 40,
    PIXEL_STEP: 1,
    START_W: $(window).width(),
    START_H: $(window).height(),
    ANCHOR_SIZE: 10,
    ANCHOR_BUFFER: 20,
    EPSILON: 10,
    ORIGIN_X: 0,
    ORIGIN_Y: 0,
    
    pixelToUnit: function(pt) {
        var ux = (pt.x() - G.graphGlobals.ORIGIN_X) / G.graphGlobals.SCALE;
        var uy = -1 * (pt.y() - G.graphGlobals.ORIGIN_Y) / G.graphGlobals.SCALE;
        return G.makePoint(ux, uy);
    },

    unitToPixel: function(pt) {
        var px = (pt.x() * G.graphGlobals.SCALE) + G.graphGlobals.ORIGIN_X;
        var py = -1 * (pt.y() * G.graphGlobals.SCALE) + G.graphGlobals.ORIGIN_Y;
        return G.makePoint(px, py);
    }
    
};