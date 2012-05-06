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

        if (G.opts.tblVert) {
            var tableHeight = 225;
            $(document).find("#eqns").css("height", $(document).height() - tableHeight);
        }
        else {
            $(document).find("#eqns").css("height", "100%");
        }
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
