G.makeEqnView = function () {
    var me = G.makeRepView();

    // Displays a text field with a function name f(x)
    // As the user types an equation, parses the equation
    // Also tries to simplify the equation if possible, and shows a
    // simplify button if it is possible
    //
    // Number coefficients in the equation are scrubbable

    var $content, lastLatexStr, fun;

    me.display = function (afun, $parent) {
        //console.log(
        //    afun,
        //     afun.coefs,
        //     toEqnString(fun.coefs) 
        //);
        fun = afun;
        // If the function is storing an old eqnStr, then we should
        // display that, because that was what the user last typed.
        // If not, then it got new coefs from another rep, so we
        // should get our eqnStr from them.
        var displayEqn = fun.getRepData("eqn").eqnStr ?
             fun.getRepData("eqn").eqnStr :
             toEqnString(fun.coefs);
            //console.log(fun.coefs, displayEqn,toEqnString(fun.coefs) );

        $content = $("<span>" + displayEqn + "</span>")
            .appendTo($parent)
            .keyup(handleKey)
            .mathquill("editable")
            .toggleClass("parse-error", fun.coefs ? false : true)
            .focus();

        lastLatexStr = $content.mathquill("latex");
    };

    function handleKey(e) {
        console.log("key");
        var newLatexStr = $content.mathquill("latex");
        if (newLatexStr !== lastLatexStr) {
            console.log("old latex", lastLatexStr, 'new latex', newLatexStr);
            me.broadcast("eqnChanged", {
                fun: fun,
                eqnStr: latexToEqn(newLatexStr)
            });
        }
        lastLatexStr = newLatexStr;
        //$display.html(eqnToHTML(eqnStr));
        //$("#out").html(coefs ? coefs.toString() : "parse error");
    }

    function toEqnString(coefs) {
        return _.chain(coefs)
            .map(G.u.roundTo(2))
            .map(function (coef, i) {
                var xterm = (i === 0) ? "" :
                            (i === 1) ? "x" :
                                        "x^" + i;
                return  (coef === 0)          ? "" :
                        (coef === 1 && i > 0) ? xterm :
                                                coef + xterm ;
            })
            .compact().value()
            .reverse()
            .join("+");
    }

    function latexToEqn(latexStr) {
        return latexStr.replace(/\\cdot/g, "*");
    }
    //console.log(toEqnString([0,1,2,0]));
    //console.log(toEqnString([0]));

    return me;
};
