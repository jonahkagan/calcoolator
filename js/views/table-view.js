G.makeTableView = function () {
    var me = G.makeRepView();

    var $content, fun;
    var round = G.u.roundTo(2);

    me.display = function (afun, $parent) {
        fun = afun;
        $content = createTable();
        $content.appendTo($parent);
        me.updateSelect();
    };

    function createTable() {
        var rows = _.map(fun.repData("table"), function (pt) {
            return "<tr><td><span class=\"tbl-x\">" +
                        fmt(pt.x()) +
                    "</span></td>" +
                    "<td><span class=\"tbl-y\">" +
                        fmt(pt.y()) +
                    "</span></td></tr>";
        });
        $table = $(
        "<div class=\"tbl\">" +
            "<table>" +
                "<tr>" +
                    "<th><span>x</span></th>" +
                    "<th>" + 
                        "<span class=\"fun-name\">" + fun.name + "</span>" +
                        "<span>(x)</span>" + 
                    "</th>" +
                "</tr>" +
                rows.join("") +
            "</table>" +
            "<div class=\"remove\">X</div>" +
        "</div>"
        ); 

        $table.addClass(G.opts.tblVert ? "vert" : "horz");

        $table.find("tr").each(function (i, row) {
            if (i > 0 && i <= fun.degree+1) {
                $(row).addClass("seed");
            }
        });

        $table.find(".tbl-x")
            .mathquill("editable")
            .keyup(onKeyUp)

        $table.find("th span")
            .mathquill();

        $table.find(".fun-name")
            .css("color", fun.color.toCSS());

        $table.find(".tbl-y")
            .css("color", fun.color.toCSS());

        $table.find("tr").not(".seed").find(".tbl-y")
            .mathquill();

        $table.find(".seed .tbl-y")
            .mathquill("editable")
            .keyup(onKeyUp);

        var $remove = $table.find(".remove")
            .hide()
            .click(removeFunction)
            .mousedown(function (e) { e.stopPropagation(); });

        $table.hover(function (e) { $remove.show(); },
                       function (e) { $remove.hide(); });


        $table.click(selectFunction);

        return $table;
    }

    me.update = function () {
        //$table = createTable();
        //$content.replaceWith($table);
        //$content = $table;
        var ys = _.map(fun.repData("table"), function (pt) { return pt.y(); });
        $content.find(".tbl-y").each(function (i, span) {
            $(span).mathquill("latex", fmt(ys[i]));
        });
    };

    me.updateSelect = function () {
        console.log("update", fun.name);
        $content.toggleClass("selected", fun.isSelected);
    };

    function onKeyUp(e) {
        var newPts = _.chain($content.find("tr"))
            .rest() // drop the header row
            .map(function (row) {
                var coords = $(row).find("td > span"),
                    x = parseFloat($(coords[0]).mathquill("latex")),
                    y = parseFloat($(coords[1]).mathquill("latex"));
                if (_.isNaN(x) || _.isNaN(y)) {
                    $(row).addClass("nan");
                    return;
                }
                $(row).removeClass("nan");
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
        me.broadcast("tableSelected", { fun: fun });
        // Stop bubbling so we don't select twice/infinite loop
        e.stopPropagation();
    }

    function removeFunction(e) {
        me.broadcast("tableRemoved", { fun: fun });
        // Stop bubbling to avoid selecting when we should be removing
        e.stopPropagation();
    }

    me.fun = function () { return fun; };

    function fmt(n) {
        return (n !== null) ? round(n) + "" : "?";
    }

    return me;
};
