G.makeTableController = function (model) {
    var me = G.makeController(model, "table");

    var NUM_PTS = 10;

    var tableDude = G.makeTableDudeView(NUM_PTS);

    tableDude.subscribe("tableChanged", onTableChange);
    tableDude.subscribe("newFunction", me.onNewFunction);
    tableDude.subscribe("tableSelected", me.onSelectFunction);
    tableDude.subscribe("tableRemoved", me.onRemoveFunction);
    tableDude.display();

    me.onUpdate = function (event) {
        // Only redisplay eqns if another representation
        // submitted the change
        if (event.src === me.name && event.changedFun) {
            tableDude.changeTable(event.changedFun);
        } else if (event.selectedFun) {
            tableDude.selectTable(event.selectedFun);
        } else {
            if (event.changedFun) { evalPts(event.changedFun); }
            _.each(event.functions, function (fun) {
                if (!fun.repData(me.name)) {
                    fun.repData(me.name, _.map(_.range(NUM_PTS), G.makePoint));
                    evalPts(fun);
                }

            });
            tableDude.display(event.functions);
        }
    };

    function onTableChange(event) {
        event.fun.repData(me.name, event.pts);
        var coefs = event.fun.fitToPoints(
            _.first(event.pts, event.fun.degree + 1));
        if (coefs) {
            console.log("new coefs", coefs);
            event.fun.coefs(coefs);
        } else {
            console.log("no fun from points", event.xs);
            event.fun.coefs(null);
        }
        model.changeFunction(event.fun, me.name);
    }
    
    function evalPts(fun) {
        fun.repData(me.name, _.map(fun.repData(me.name), function (pt) {
            return G.makePoint(pt.x(), fun.evaluate(pt.x()));
        }));
    }

    return me;
};
