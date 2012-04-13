G.makeEqnDudeView = function () {
    var me = G.makeDudeView();

    var $content = $("#eqns"), eqvs;

    me.display = function (funs) {
        eqvs = [];
        $content.empty();
        // Display all the equation editors
        _.each(funs, function (fun) {
            var eqv = G.makeEqnView();
            eqv.display(fun, $content);
            eqv.subscribe("eqnChanged", onEqnChange);
            eqv.subscribe("eqnSelected", onEqnSelect);
            eqvs.push(eqv);
        });

        // Display a new equation box
        $("<div class=\"new-eqn\">Add new equation...</div>")
            .appendTo($content)
            .click(function () {
                me.broadcast("newFunction");
            });
    };

    me.updateEqn = function (changedFun) {
        _.find(eqvs, function (eqv) {
            return eqv.fun() === changedFun;
        }).update(changedFun);

        _.each(eqvs, function (eqv) {
            eqv.updateSelectedStatus();
        });
    };

    function onEqnChange(event) {
        me.broadcast("eqnChanged", event);
    }

    function onEqnSelect(event) {
        me.broadcast("eqnSelected", event);
    }

    return me;
};
