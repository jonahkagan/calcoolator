G.makeEqnController = function (model) {
    var me = G.makeController(model, "eqn");

    var eqnDude = G.makeEqnDudeView();

    eqnDude.subscribe("eqnChanged", onEqnChange);
    eqnDude.subscribe("newFunction", me.onNewFunction);
    eqnDude.subscribe("selectFunction", me.onSelectFunction);
    eqnDude.display();

    me.onUpdate = function (data) {
        // TODO handle new, remove, select
        if (data.src === me.name && data.changedFun) {
            // Find the eqn that changed and update it with the
            // results of the parse TODO
        } else {
            // Only display new eqns if another representation
            // submitted the change
            
            // Remove the old eqn string from the changed function so
            // the view can make a new one.
            if (data.changedFun) {
                _.find(data.functions, function (fun) {
                    return fun === data.changedFun;
                }).setRepData(null);
            }

            eqnDude.display(data.functions);
        }
    };

    function onEqnChange(data) {
        // Update the fun based on the new eqnStr
        data.fun.repData("eqn", data.eqnStr);
        var coefs = parser.parseAndSimplify(data.eqnStr);
        if (coefs) {
            console.log("new coefs", coefs);
            data.fun.coefs(coefs);
        } else {
            console.log("no parse for " + data.eqnStr);
            data.fun.coefs(null);
        }
        model.changeFunction(data.fun, "eqn");
    }

    return me;
};
