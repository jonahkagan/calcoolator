G.makeEqnController = function (model) {
    var me = G.makeController(model, "eqn");

    var eqnDude = G.makeEqnDudeView();

    eqnDude.subscribe("eqnChanged", onEqnChange);
    eqnDude.subscribe("newFunction", me.onNewFunction);
    eqnDude.subscribe("selectFunction", me.onSelectFunction);
    eqnDude.display();

    me.onUpdate = function (event) {
        // Only redisplay eqns if another representation
        // submitted the change
        if (event.src === me.name && event.changedFun) {
            // Update the changed eqn with the results of the parse
            eqnDude.updateEqn(event.changedFun);
        } else {
            // Remove the old eqn string from the changed function so
            // the view can make a new one.
            if (event.changedFun) { event.changedFun.repData(null); }

            eqnDude.display(event.functions);
        }
    };

    function onEqnChange(event) {
        // Update the fun based on the new eqnStr
        event.fun.repData("eqn", event.eqnStr);
        var coefs = parser.parseAndSimplify(event.eqnStr);
        if (coefs) {
            console.log("new coefs", coefs);
            event.fun.coefs(coefs);
        } else {
            console.log("no parse for " + event.eqnStr);
            event.fun.coefs(null);
        }
        model.changeFunction(event.fun, "eqn");
    }

    return me;
};
