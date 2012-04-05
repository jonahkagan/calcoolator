G.init = function(p) {
    // global event manager for global events
    G.eventManager = G.makeEventManager();
    var model = G.makeModel();

    var graphController = G.makeGraphController(model, p);

};

G.die = function(msg, obj) { console.log(msg); }
