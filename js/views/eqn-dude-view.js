G.makeEqnDudeView = function () {
    var me = G.makeDudeView();

    var $content = $("#eqns");

    me.display = function (funs) {
        $content.empty();
        _.each(funs, function (fun) {
            G.makeEqnView().display(fun, $content);
        });
    };

    return me;
};
