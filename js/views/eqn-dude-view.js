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
            me.bubble(eqv, "eqnChanged");
            me.bubble(eqv, "eqnSelected");
            me.bubble(eqv, "eqnRemoved");
            eqvs.push(eqv);
        });

        // Display a new equation box
        $("<div class=\"new-eqn\">" +
                "<span id=\"new-fun-name\">f</span>" +
                "<span id=\"new-eqn-of-x\">(x)=</span>" +
          "</div>")
            .appendTo($content)
            .click(function () {
                me.broadcast("newFunction");
            });
            
        $content.find("#new-fun-name").mathquill();
        $content.find("#new-eqn-of-x").mathquill();
    };

    me.changeEqn = function (changedFun) {
        _.find(eqvs, function (eqv) {
            return eqv.fun() === changedFun;
        }).update();
    };

    me.selectEqn = function (selectedFun) {
        _.each(eqvs, function (eqv) {
            eqv.updateSelect();
        });
    };

    return me;
};
