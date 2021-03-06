G.makeEqnView = function () {
    var me = G.makeRepView();

    var MIN_FONT_SIZE = 10,
        MAX_FONT_SIZE = 16,
        FONT_RESIZE_PCT = 0.75;

    // Displays a text field with a function name f(x).
    // As the user types an equation, parses the equation
    // Also tries to simplify the equation if possible, and shows a
    // simplify button if it is possible.
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
                "<span class=\"fun-name\">" + fun.name + "</span>" +
                "<span class=\"eqn-of-x\">(x)=</span>" +
                "<span class=\"eqn-editor\">" + displayEqn + "</span>" +
            "</div>"
            )
            .appendTo($parent)
            .keydown(onKeyDown)
            .keyup(onKeyUp)
            // Pass the same event through to the editor so it knows
            // the position of the mouse
            .mousedown(function (e) { $editor.trigger(e); });

        $content.find(".fun-name").mathquill().css("color", fun.color.toCSS());
        $content.find(".eqn-of-x").mathquill();
        $editor = $content.find(".eqn-editor")
            .mathquill("editable")
            .mousedown(selectFunction);
            //.find("span").addClass("scrubbable");

        refresh();

        lastLatexStr = $editor.mathquill("latex");
    };

    me.update = function () {
        if (isDragging) {
            $editor.mathquill("latex", toEqnString(fun.coefs()));
            colorCoefs();
        } else {
            refresh();
        }
    };

    me.updateSelect = function () {
        updateSelectedStatus();
    };

    function updateSelectedStatus() {
        $content.toggleClass("selected", fun.isSelected);
    }

    function refresh() {
        createScrubbers();
        updateParseStatus();
        updateSelectedStatus();
        resizeFont();
    }

    function colorCoefs(seqs) {
        _.chain(seqs || findSeqs())
            .filter(function (seq) { return seq.type === "num"; })
            .each(function (seq) {
                $(seq.spans).addClass("scrubbable");
                $(seq.spans).css("color", fun.color.toCSS());
            });
    }

    function updateParseStatus() {
        $editor.toggleClass("parse-error", fun.coefs() ? false : true);
    }

    function onKeyUp(e) {
        if (e.which === 13) { // simplify on Enter
            $editor.mathquill("latex", toEqnString(fun.coefs())); 
            refresh();
            return;
        }
        //console.log(e.which);
        var newLatexStr = $editor.mathquill("latex");
        if (newLatexStr !== lastLatexStr) {
            //console.log("old latex", lastLatexStr, 'new latex', newLatexStr);
            me.broadcast("eqnChanged", {
                fun: fun,
                eqnStr: latexToEqn(newLatexStr)
            });
        }
        lastLatexStr = newLatexStr;
    }

    function onKeyDown(e) {
        resizeFont();
        colorCoefs();
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

    function findSeqs() {
        // Find sequences of spans that represent numbers
        // (i.e., neighboring spans with digits or decimal points).
        return _.reduce($editor.children(), function (seqs, span) {
            // Find the next non-zero coef
            if (span.nodeName === "SPAN" &&
                // If num, dash, or dot
                /[0-9\.\-]/.test(fixMinus($(span).text())))
            {
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
    }

    // Create scrubbable numbers in the editor
    function createScrubbers() {
        var coefs = fun.coefs(); if (!coefs) { return; }

        // We have to work around mathquill here.
        var seqs = findSeqs(),
            coefPos = 0;

        // Associate each seq of spans with a coef and add the
        // handlers
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

        colorCoefs(seqs);
    }

    var isDragging;
    function addDragHandler(spans, coefPos) {
        var orig, cur,
            val = parseFloat(_.map(spans, function (span) {
                return fixMinus($(span).text());
            }).join(''));
            //console.log("val", val);

        var onMouseDown = function (e) {
            console.log("down");
            isDragging = true;
            cur = e.pageX;
            $("body").addClass("scrubbing");
            $(document).on("mousemove", onMouseMove);
            $(document).on("mouseup", onMouseUp);
            e.originalEvent.preventDefault(); // prevents text cursor
        };

        $(spans)
            .off("mousedown")
            .addClass("scrubbable")
            .one("mousedown", onMouseDown);

        var onMouseMove = function (e) {
            console.log("move", fun.name);
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
            }
        }

        var onMouseUp = function (e) {
            console.log("up");
            isDragging = false;
            $("body").removeClass("scrubbing");
            $(document).off("mousemove", onMouseMove);
            $(document).off("mouseup", onMouseUp);
            refresh();
        }
    }

    function splitSpan($span) {
        return _.map(
            $span.text().split(""),
            function (char) {
                return "<span>" + char + "</span>";
            }
        ).join("");
    }

    // Dynamically resize equation text to fit the editor
    function resizeFont() {
        var edWidth = $editor.width(),
            $ofX =  $content.find(".eqn-of-x"),
            maxWidth = $content.width() - ($ofX.position().left + $ofX.width()),
            size = parseFloat($content.css("font-size"));

        if (edWidth > maxWidth && size > MIN_FONT_SIZE) {
            $content.css("font-size", "-=" + 1);
            resizeFont();
        } else if (edWidth < maxWidth * FONT_RESIZE_PCT &&
                   size < MAX_FONT_SIZE)
        {
            $content.css("font-size", "+=" + 1);
            resizeFont();
        }
    }

    function toEqnString(coefs) {
        var str = _.chain(coefs)
            .map(_.roundTo(2))
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
        return str.length > 0 ? str : "0";
    }

    function latexToEqn(latexStr) {
        return latexStr.replace(/\\cdot/g, "*")
            .replace(/\\\:/g, " ")
            .replace(/\{/g, "(")
            .replace(/\}/g, ")")
            .replace(/\\right/g, "")
            .replace(/\\left/g, "");
    }
    
    // Replaces the 'minus' character with a hyphen
    function fixMinus(str) {
       if (str.charCodeAt(0) === 8722) { str = "-"; } 
       return str;
    }

    me.fun = function () { return fun; };

    return me;
};
