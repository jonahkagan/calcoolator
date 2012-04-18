G.makeTableView = function () {
    var me = G.makeRepView();

    var $content, fun;

    me.display = function (afun, $parent) {
        fun = afun;
        var rows = _.map(fun.repData("table"), function (pt) {
            return "<tr><td><span class=\"tbl-x\">" +
                        G.u.round(2, pt.x()) +
                    "</span></td>" +
                    "<td><span class=\"tbl-y\">" +
                        (pt.y() !== null ? G.u.round(2, pt.y()) : "?") +
                    "</span></td></tr>";
        });
        $content = $(
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
        $content.find("tr").each(function (i, row) {
            $(row).find("span").each(function (j, span) {
                var $span = $(span);
                //console.log($(span), $(span).is("tbl-x"));
                $span.mathquill($span.hasClass("tbl-x") ? "editable" : "");
                if ($span.hasClass("tbl-y") || $span.hasClass("fun-name")) {
                    $span.css("color", fun.color.toCSS());
                }
            });
            if (i > 0 && i <= fun.degree+1) {
                $(row).addClass("seed");
            }
        });
        $content.appendTo($parent);
    };

    me.update = function () {
    };

    me.updateSelect = function () {
    };

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
