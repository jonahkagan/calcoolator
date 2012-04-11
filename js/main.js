G.init = function(p) {
    // global event manager for global events
    G.eventManager = G.makeEventManager();
    var model = G.makeModel();

    var graphController = G.makeGraphController(model, p);
    var eqnController = G.makeEqnController(model);

};

G.color = function(r, g, b) {
    return {
        r: r,
        g: g,
        b: b
    }
};

G.die = function(msg, obj) { console.error(msg); }
