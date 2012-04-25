G.makeTableView = function () {
    var me = G.makeRepView();

    var $content, fun, coords;
    var round = G.u.roundTo(2);

    me.display = function (afun, $parent) {
        fun = afun;
        coords = _.map(fun.repData("table"), function (pt) {
            var xStr = fmt(pt.x()), yStr = fmt(pt.y());
            return {
                x: xStr,
                y: yStr,
                xCon: makeCoordContent(xStr, "tbl-x"),
                yCon: makeCoordContent(yStr, "tbl-y")
            };
        });
        $content = createTable();
        $content.appendTo($parent);
        me.updateSelect();
        updateSeeds();
    };

    function makeCoordContent(num, klass) {
        return $("<span class=" + klass + ">" + num + "</span>");
    }

    function header(c) { 
        return (c === "x") ?
            "<th><span>x</span></th>" :
            "<th>" + 
                "<span class=\"fun-name\">" + fun.name + "</span>" +
                "<span>(x)</span>" + 
            "</th>";
    }

    function makeHorzTable($table) {
        function row(c) {
            var $row = $("<tr></tr>")
                .appendTo($table)
                .append(header(c));
            _.each(coords, function (coord) { 
                coord[c + "Con"]
                    .appendTo($row)
                    .wrap("<td></td>");
            });
        }
        row("x");
        row("y");
    }

    function makeVertTable($table) {
        $table.append("<tr>" + header("x") + header("y") + "</tr>")
        _.each(coords, function (coord) {
            $("<tr></tr>")
                .appendTo($table)
                .append(coord.xCon)
                .append(coord.yCon)
                .find("span").wrap("<td></td>");
        });
    }

    function createTable() {
        $table = $(
            "<div class=\"tbl\">" +
                "<table></table>" +
                "<div class=\"remove\">X</div>" +
            "</div>"
            ) 
            .click(selectFunction)
            .addClass(G.opts.tblVert ? "vert" : "horz");
       
        (G.opts.tblVert ? makeVertTable : makeHorzTable)($table.find("table"));

        $table.find(".tbl-x")
            .mathquill("editable")
            .keyup(onKeyUp)

        $table.find("th span")
            .mathquill();

        $table.find(".fun-name")
            .css("color", fun.color.toCSS());

        $table.find(".tbl-y")
            .css("color", fun.color.toCSS());

        var $remove = $table.find(".remove")
            .hide()
            .click(removeFunction)
            .mousedown(function (e) { e.stopPropagation(); });

        $table.hover(function (e) { $remove.show(); },
                     function (e) { $remove.hide(); });

        return $table;
    }

    me.update = function () {
        //$table = createTable();
        //$content.replaceWith($table);
        //$content = $table;
        updateSeeds(); // For some reason, need to do this before updating numbers
        G.u.with2(_.each, fun.repData("table"), coords,
            function (pt, coord) {
                // Don't update while typing
                if (!coord.yCon.find("textarea").is(":focus")) {
                    coord.yCon.mathquill("latex", fmt(pt.y()));
                }
            });
    };

    me.updateSelect = function () {
        $content.toggleClass("selected", fun.isSelected);
    };

    function updateSeeds() {
        _.chain(coords)
            //.first(fun.degree + 1)
            .each(function (coord, i) {
                coord.xCon.parent().toggleClass("seed", i <= fun.degree);
                coord.yCon.parent().toggleClass("seed", i <= fun.degree);
            });

        $table.find("td:not(.seed) .tbl-y")
            .mathquill("revert")
            .mathquill();

        $table.find("td.seed .tbl-y")
            .mathquill("revert")
            .mathquill("editable")
            .keyup(onKeyUp);
    }


    function onKeyUp(e) {
        var newPts = _.map(coords, function (coord) {
            var x = parseFloat(coord.xCon.mathquill("latex")),
                y = parseFloat(coord.yCon.mathquill("latex"));
            $(coord.xCon).toggleClass("nan", _.isNaN(x));
            $(coord.yCon).toggleClass("nan", _.isNaN(y));
            if (_.isNaN(x) || _.isNaN(y)) { return null; }
            return G.makePoint(x, y);
        });

        if (_.all(newPts, function (pt) { return pt; }) &&
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
        return (n !== null) ? (round(n) + "") : "?";
    }

    return me;
};
