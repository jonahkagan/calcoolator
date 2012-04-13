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
            bubble(eqv, "eqnChanged");
            bubble(eqv, "eqnSelected");
            bubble(eqv, "eqnRemoved");
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

    // Subscribes to an event on the eqn view and bubbles the same
    // event up to the controller
    function bubble(eqv, eventName) {
        eqv.subscribe(eventName, function (e) {
            me.broadcast(eventName, e);
        });
    }

    return me;
};
