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
    };

    function onEqnChange(data) {
        me.broadcast("eqnChanged", data);
    }

    return me;
};
