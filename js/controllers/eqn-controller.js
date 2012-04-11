G.makeEqnController = function (model) {
    var me = G.makeController(model);

    var eqnDude = G.makeEqnDudeView();

    eqnDude.subscribe("eqnChanged", onEqnChange);
    eqnDude.subscribe("newFunction", me.onNewFunction);
    eqnDude.subscribe("selectFunction", me.onSelectFunction);
    eqnDude.display();

    me.onUpdate = function (data) {
        if (data.src === "eqn") {
            // Find the eqn that changed and update it with the
            // results of the parse TODO
        } else {
            // Only display new eqns if another representation
            // submitted the change
            eqnDude.display(data.functions);
        }
    };

    function onEqnChange(data) {
        model.changeFunction(data.fun, "eqn", data.eqnStr);
    }

    return me;
};
