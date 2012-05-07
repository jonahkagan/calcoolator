G.makeTableDudeView = function () {
    var me = G.makeDudeView();

    var $content = $("#tbls"), tables;

    me.display = function (funs) {
        tables = [];
        $content
            .addClass(G.opts.tblVert ? "vert" : "horz")
            .removeClass(G.opts.tblVert ? "horz" : "vert")
            .empty();
        // Display all the tables
        tables = _.map(funs, function (fun) {
            var table = G.makeTableView();
            table.display(fun, $content);
            me.bubble(table, "tableChanged");
            me.bubble(table, "tableSelected");
            me.bubble(table, "tableRemoved");
            return table;
        });

        if (G.opts.tblVert) {
            var tableHeight = 225;
            $content.css("top", $(document).height() - tableHeight);
        }
    };

    me.changeTable = function (changedFun) {
        _.find(tables, function (table) {
            return table.fun() === changedFun;
        }).update();
    };

    me.selectTable = function (selectedFun) {
        _.each(tables, function (table) {
            table.updateSelect();
        });
    };

    return me;
};
