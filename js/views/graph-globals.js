G.graphGlobals = {
    SCALE: 20, // num pixels per unit
    ZOOM: 0.05, // pct to zoom by
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
    
    nearestX: function(x) {
        var lineSpace = (40 + G.graphGlobals.SCALE % 40) / 2;
        var distFromOrigin = x - G.graphGlobals.ORIGIN_X;
        var lineBefore = Math.floor(distFromOrigin / lineSpace);
        var lineAfter = lineBefore + 1;        
        lineBefore = lineBefore * lineSpace + G.graphGlobals.ORIGIN_X;
        lineAfter = lineAfter * lineSpace + G.graphGlobals.ORIGIN_X;
        return (Math.abs(x - lineBefore) < Math.abs(x - lineAfter)) ? lineBefore : lineAfter;
    },
    
    nearestY: function(y) {
        var lineSpace = (40 + G.graphGlobals.SCALE % 40) / 2;
        var distFromOrigin = y - G.graphGlobals.ORIGIN_Y;
        var lineBefore = Math.floor(distFromOrigin / lineSpace);
        var lineAfter = lineBefore + 1;        
        lineBefore = lineBefore * lineSpace + G.graphGlobals.ORIGIN_Y;
        lineAfter = lineAfter * lineSpace + G.graphGlobals.ORIGIN_Y;
        return (Math.abs(y - lineBefore) < Math.abs(y - lineAfter)) ? lineBefore : lineAfter;
    }
    
};
