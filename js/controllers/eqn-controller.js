G.makeEqnController = function (model) {
    var me = G.makeController(model);

    var eqnDude = G.makeEqnDudeView();

    me.onUpdate = function (data) {
        eqnDude.display(data.functions);
    }

    return me;
};
