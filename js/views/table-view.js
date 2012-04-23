G.makeTableView = function () {
    var me = G.makeRepView();

    var $content, $seeds = [], fun;

    me.display = function (afun, $parent) {
        fun = afun;
        $content = createTable();
        $content.appendTo($parent);
    };

    function createTable() {
        var rows = _.map(fun.repData("table"), function (pt) {
            return "<tr><td><span class=\"tbl-x\">" +
                        G.u.round(2, pt.x()) +
                    "</span></td>" +
                    "<td><span class=\"tbl-y\">" +
                        (pt.y() !== null ? G.u.round(2, pt.y()) : "?") +
                    "</span></td></tr>";
        });
        $table = $(
            "<div class=\"tbl\"><table>" +
                "<tr>" +
                    "<th><span>x</span></th>" +
                    "<th>" + 
                        "<span class=\"fun-name\">" + fun.name + "</span>" +
                        "<span>(x)</span>" + 
                    "</th>" +
                "</tr>" +
                rows.join("") +
            "</table></div>"
        ); 

        $table.find("tr").each(function (i, row) {
            if (i > 0 && i <= fun.degree+1) {
                $seeds.push($(row).addClass("seed"));
            }
        });

        $table.find(".tbl-x")
            .mathquill("editable")
            .keyup(onKeyUp)

        $table.find(".fun-name")
            .mathquill()
            .css("color", fun.color.toCSS());

        $table.find(".seed .tbl-y")
            .mathquill("editable")
            .keyup(onKeyUp);

        $table.find(".tbl-y")
            .mathquill()
            .css("color", fun.color.toCSS());

        return $table;
    }

    me.update = function () {
        $table = createTable();
        $content.replaceWith($table);
        $content = $table;
    };

    me.updateSelect = function () {
    };

    function onKeyUp(e) {
        var newPts = _.chain($content.find("tr"))
            .rest() // drop the header row
            .map(function (row) {
                var coords = $(row).find("td > span"),
                    x = parseFloat($(coords[0]).mathquill("latex")),
                    y = parseFloat($(coords[1]).mathquill("latex"));
                return G.makePoint(x, y);
            }).value();

        if (_.all(newPts, function (pt) { return pt !== undefined; }) &&
            !G.u.listEquals(newPts, fun.repData("table"), G.makePoint.equals))
        {
            me.broadcast("tableChanged", {
                fun: fun,
                pts: newPts,
                coord: $(e.currentTarget).hasClass("tbl-x") ? "x" : "y"
            });
        }
    }

    function selectFunction(e) {
        me.broadcast("eqnSelected", { fun: fun });
        // Stop bubbling so we don't select twice/infinite loop
        e.stopPropagation();
    }

    function removeFunction(e) {
        me.broadcast("eqnRemoved", { fun: fun });
        // Stop bubbling to avoid selecting when we should be removing
        e.stopPropagation();
    }

    me.fun = function () { return fun; };

    return me;
};
