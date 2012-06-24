G.makeTableController = function (model) {
    var me = G.makeController(model, "table");

    var NUM_PTS = 5;

    var tableDude = G.makeTableDudeView(NUM_PTS);

    tableDude.subscribe("tableChanged", onTableChange);
    //tableDude.subscribe("newFunction", me.onNewFunction);
    tableDude.subscribe("tableSelected", me.onSelectFunction);
    tableDude.subscribe("tableRemoved", me.onRemoveFunction);
    tableDude.display();

    me.onUpdate = function (event) {
        if (event.changedFun) {
            evalPts(event.changedFun);
            tableDude.changeTable(event.changedFun);
        } else if (event.selectedFun) {
            tableDude.selectTable(event.selectedFun);
        } else { // New or remove
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
        if (event.coord === "x") {
            // If x coord changes, just reevaluate the points
            evalPts(event.fun);
            tableDude.changeTable(event.fun);
        } else if (event.coord === "y") {
            // If y coord changes, then we change the function
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
    }
    
    function evalPts(fun) {
        fun.repData(me.name, _.map(fun.repData(me.name), function (pt) {
            return G.makePoint(pt.x(), fun.evaluate(pt.x()));
        }));
    }

    return me;
};
