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

        // Display a new equation box
        $("<div class=\"tbl\" id=\"new-table\">Add new table...</div>")
            .appendTo($content)
            .click(function () {
                me.broadcast("newFunction");
            });
            
        if (G.opts.tblVert) {
            var tableHeight = 215;
            $content.css("top", $(document).height() - tableHeight);
            $("#tbls-bg").addClass("vert");
            $("#tbls-bg").css("top", $(document).height() - tableHeight);
            $("#new-table").css("height", tableHeight-10);
            $("#new-table").css("top", -tableHeight+10);

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
