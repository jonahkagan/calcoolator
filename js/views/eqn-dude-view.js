G.makeEqnDudeView = function () {
    var me = G.makeDudeView();

    var $content = $("#eqns");

    me.display = function (funs) {
        $content.empty();
        // Display all the equation editors
        _.each(funs, function (fun) {
            var eqv = G.makeEqnView();
            eqv.display(fun, $content);
            eqv.subscribe("eqnChanged", onEqnChange);
        });

        // Display a new equation box
        $("<div class=\"new-eqn\">Add new equation...</div>")
            .appendTo($content)
            .click(function () {
                me.broadcast("newFunction");
            });
    };

    function onEqnChange(data) {
        me.broadcast("eqnChanged", data);
    }

    return me;
};
