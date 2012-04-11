G.makeEqnDudeView = function () {
    var me = G.makeDudeView();

    var $content = $("#eqns");

    me.display = function (funs) {
        $content.empty();
        _.each(funs, function (fun) {
            var eqv = G.makeEqnView();
            eqv.display(fun, $content);
            eqv.subscribe("eqnChanged", onEqnChange);
        });
    };

    function onEqnChange(data) {
        me.broadcast("eqnChanged", data);
    }


    return me;
};
