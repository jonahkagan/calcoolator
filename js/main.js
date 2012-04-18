G.init = function(p) {
    // global event manager for global events
    G.eventManager = G.makeEventManager();
    var model = G.makeModel();

    var graphController = G.makeGraphController(model, p);
    var eqnController = G.makeEqnController(model);
    var tableController = G.makeTableController(model);

    _.defer(model.newFunction);

    G.opts = {};
    $('#opts').children().each(function (i, optCheck) {
        $(optCheck).change(function () {
            G.opts[optCheck.id] = optCheck.checked;
            model.removeFunction();
        }).change();
    });
    
    // utility functions from processing
    G.dist = p.dist;
};

G.color = function(r, g, b) {
    return {
        r: r,
        g: g,
        b: b,
        toCSS: function () {
            return "rgb(" + r + "," + g + "," + b + ")";
        }
    };
};

G.die = function(msg, obj) { console.error(msg); }
