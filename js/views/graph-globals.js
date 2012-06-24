G.graphGlobals = {
    SCALE: 20, // num pixels per unit
    ZOOM: 0.05, // pct to zoom by
    MIN_SQUARE_SIZE: 40,
    MAX_SQUARE_SIZE: 80,
    PIXEL_STEP: 1,
    UNIT_STEP: null, // to be calculated
    START_W: $(window).width(),
    START_H: $(window).height(),
    ANCHOR_SIZE: 10,
    ANCHOR_BUFFER: 20,
    EPSILON: 10,
    ORIGIN_X: 0,
    ORIGIN_Y: 0,
    MAJOR_LINES: 10, // how many major gridlines to aim for

    fmtLabel: function (n) {
        return _.round(5, n) + '';
    },
    
    pixelsPerUnit: function() {
        return G.graphGlobals.SCALE;
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
    
    nearestPoint: function(pixelPt) {
        var unitPt = G.graphGlobals.pixelToUnit(pixelPt);
        return G.graphGlobals.unitToPixel(G.makePoint(
            _.roundWithin(G.graphGlobals.UNIT_STEP, unitPt.x()),
            _.roundWithin(G.graphGlobals.UNIT_STEP, unitPt.y())));
    },
};
