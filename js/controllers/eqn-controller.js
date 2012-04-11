G.makeEqnController = function (model) {
    var me = G.makeController(model);

    var eqnDude = G.makeEqnDudeView();

    eqnDude.subscribe("eqnChanged", onEqnChange);

    me.onUpdate = function (data) {
        eqnDude.display(data.functions);
    };

    function onEqnChange(data) {
        model.changeFunction(data.fun, "eqn", data.eqnStr);
    }

    return me;
};
