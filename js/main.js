G.init = function(p) {
    function initOpts() {
        G.opts = {};
        var realLog = console.log;
        $('#opts').children().each(function (i, optCheck) {
            $(optCheck).change(function () {
                G.opts[optCheck.id] = optCheck.checked;
                model.removeFunction(); // refresh without doing anything
                if (optCheck.id === "debug") {
                   console.log = optCheck.checked ?
                        realLog :
                        function () {};
                }
            }).change();
        });
    }
    
    // global event manager for global events
    G.eventManager = G.makeEventManager();
    var model = G.makeModel();

    initOpts();

    var graphController = G.makeGraphController(model, p);
    var eqnController = G.makeEqnController(model);
    var tableController = G.makeTableController(model);

    _.defer(model.newFunction);
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
