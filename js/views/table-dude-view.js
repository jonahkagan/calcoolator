G.makeTableDudeView = function () {
    var me = G.makeDudeView();

    var $content = $("#tbls"), tables;

    me.display = function (funs) {
        tables = [];
        $content.empty();
        // Display all the tables
        tables = _.map(funs, function (fun) {
            var table = G.makeTableView();
            table.display(fun, $content);
            me.bubble(table, "tableChanged");
            me.bubble(table, "tableSelected");
            me.bubble(table, "tableRemoved");
            return table;
        });

        // Display a new equation box
        $("<div class=\"new-table\">Add new table...</div>")
            .appendTo($content)
            .click(function () {
                me.broadcast("newFunction");
            });
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