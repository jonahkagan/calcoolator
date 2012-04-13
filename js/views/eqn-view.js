G.makeEqnView = function () {
    var me = G.makeRepView();

    var MIN_FONT_SIZE = 10,
        MAX_FONT_SIZE = 16,
        FONT_RESIZE_PCT = 0.75;
    // Displays a text field with a function name f(x)
    // As the user types an equation, parses the equation
    // Also tries to simplify the equation if possible, and shows a
    // simplify button if it is possible
    //
    // Number coefficients in the equation are scrubbable

    var $content, $editor, lastLatexStr, fun;

    me.display = function (afun, $parent) {
        fun = afun;
        // If the function is storing an old eqnStr, then we should
        // display that, because that was what the user last typed.
        // If not, then it got new coefs from another rep, so we
        // should get our eqnStr from them.
        var displayEqn = fun.repData("eqn") ?
             fun.repData("eqn") :
             toEqnString(fun.coefs());
        //console.log('"' + displayEqn + '"');

        $content = $(
            "<div class=\"eqn\">" +
                "<span class=\"eqn-name\">" + fun.name + "</span>" +
                "<span class=\"eqn-of-x\">(x)=</span>" +
                "<span class=\"eqn-editor\">" + displayEqn + "</span>" +
                "<button class=\"eqn-remove\">X</button>" +
            "</div>"
            )
            .appendTo($parent)
            .keyup(handleKey)
            .click(handleClick);

        $content.find(".eqn-name").mathquill().css("color", fun.color.toCSS());
        $content.find(".eqn-of-x").mathquill();
        $editor = $content.find(".eqn-editor").mathquill("editable");

        $content.find(".eqn-remove").click(handleRemove);

        refresh();

        lastLatexStr = $editor.mathquill("latex");
    };

    me.update = function (newFun) {
        if (isDragging) {
            $editor.html(toEqnString(newFun.coefs())).mathquill("editable");
        } else {
            fun = newFun;
            refresh();
        }
    };

    function updateParseStatus() {
        $editor.toggleClass("parse-error", fun.coefs() ? false : true);
    }

    me.updateSelectedStatus = function() {
        $content.toggleClass("selected", fun.isSelected);
        if (fun.isSelected) { $editor.focus(); }
    }

    function handleKey(e) {
        var newLatexStr = $editor.mathquill("latex");
        if (newLatexStr !== lastLatexStr) {
            //console.log("old latex", lastLatexStr, 'new latex', newLatexStr);
            me.broadcast("eqnChanged", {
                fun: fun,
                eqnStr: latexToEqn(newLatexStr)
            });
        }
        lastLatexStr = newLatexStr;

        createScrubbers();
        resizeFont();
    }

    function handleClick(e) {
        me.updateSelectedStatus();
        me.broadcast("eqnSelected", { fun: fun });
    }

    function handleRemove(e) {
        me.broadcast("eqnRemoved", { fun: fun });
        return false;
    }

    // Create scrubbable numbers in the editor
    function createScrubbers() {
        // We have to work around mathquill here.
        // First, find sequences of spans that represent numbers
        // (i.e., neighboring spans with digits or decimal points).
        var coefs = fun.coefs(); if (!coefs) { return; }

        var seqs = _.reduce($editor.children(), function (seqs, span) {
            // Find the next non-zero coef
            if (/[0-9\.]/.test($(span).text())) { // If num or dot
                var lastSeq = _.last(seqs);
                if (lastSeq.type === "num") { // If last span was a num
                    lastSeq.spans.push(span); // then add span to seq
                } else { // Else make new seq
                    seqs.push({
                        type: "num",
                        spans: [span]
                    });
                }
            } else if (!$(span).hasClass("cursor")) {
                seqs.push({ type: "non-num", spans: [span] });
            }
            return seqs;
        }, []);

        var coefPos = 0;

        $editor.off("mousedown");
        _.chain(seqs)
            .filter(function (s) {
                return s.type === "num";
            })
            .reverse()
            .each(function (seq) {
                while (coefPos < coefs.length &&
                       coefs[coefPos] === 0)
                { 
                    coefPos += 1;
                }
                addDragHandler(seq.spans, coefPos);
                coefPos += 1;
            });
    }

    var isDragging;
    function addDragHandler(spans, coefPos) {
        var val = parseFloat(
            _.map(spans, function (span) {
                return $(span).text();
            }).join('')),
            orig, cur;

        $(spans)
            .addClass("scrubbable")
            .mousedown(function (e) {
                cur = e.pageX;
                if (isDragging) {
                    return false;
                }
                isDragging = true;
                $(document).mousemove(function (e) {
                    if (isDragging) {
                        orig = cur;
                        cur = e.pageX;
                        var delta = (cur - orig) * 0.1;
                        val += delta ? delta : 0;
                        fun.coefs()[coefPos] = val;
                        me.broadcast("eqnChanged", {
                            fun: fun,
                            eqnStr: toEqnString(fun.coefs())
                        });
                    } else {
                        $(document).off("mousemove");
                    }
                    return false;
                });
            });
        // TODO remove this handler when done
        $(document).mouseup(function (e) {
            isDragging = false;
            $(document).off("mousemove");
            $(document).off("mouseup");
            refresh();
        });
    }

    function newSpan(val) {
        return "<span class=\"dragging\">" + G.u.round(2, val) + "</span>";
    }

    function splitSpan($span) {
        return _.map(
            $span.text().split(""),
            function (char) {
                return "<span class=\"post-drag\">" + char + "</span>";
            }
        ).join("");
    }

    function refresh() {
        createScrubbers();
        updateParseStatus();
        me.updateSelectedStatus();
        resizeFont();
    }

    // Dynamically resize equation text to fit the editor
    function resizeFont() {
        var edWidth = $editor.width(),
            maxWidth = $content.width() - $editor.position().left,
            size = parseFloat($content.css("font-size"));

        if (edWidth > maxWidth && size > MIN_FONT_SIZE) {
            $content.css("font-size", "-=" + 1);
        } else if (edWidth < maxWidth * FONT_RESIZE_PCT &&
                   size < MAX_FONT_SIZE)
        {
            $content.css("font-size", "+=" + 1);
        }
    }

    function toEqnString(coefs) {
        return _.chain(coefs)
            .map(G.u.roundTo(2))
            .map(function (coef, i) {
                var xterm = (i === 0) ? "" :
                            (i === 1) ? "x" :
                                        "x^" + i;
                return  (coef === 0)          ? "" :
                        //(coef === 1 && i > 0) ? xterm :
                                                coef + xterm ;
            })
            .compact().value()
            .reverse()
            .join("+");
    }

    function latexToEqn(latexStr) {
        return latexStr.replace(/\\cdot/g, "*")
            .replace(/\\\:/g, " ");
    }
    //console.log(toEqnString([0,1,2,0]));
    //console.log(toEqnString([0]));
    
    me.fun = function () { return fun; };

    return me;
};
