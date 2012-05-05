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
    
    G.scrambleColors();

    _.defer(model.newFunction);
    // utility functions from processing
    G.dist = p.dist;
};

G.colors = [
    {r:255, g:45, b:94}, // hot pink
    {r:0, g:169, b:123}, // sea green
    {r:255, g:106, b:6}, // orange
    {r:222, g:51, b:28}, // orange-red
    {r:92, g:186, b:0}, // light green
    {r:222, g:158, b:6}, // light orange
    {r:83, g:33, b:194}, // dark purple
    {r:0, g:186, b:225}, // light blue
    {r:11, g:65, b:238}, // dark blue
    {r:141, g:31, b:145}, // medium purple
];

G.scrambleColors = function() {
    for (var i = 0; i < 10; i++) {
        var c1 = Math.floor(Math.random() * 10);
        var c2 = Math.floor(Math.random() * 10);
        var temp = G.colors[c1];
        G.colors[c1] = G.colors[c2];
        G.colors[c2] = temp;
    }
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
