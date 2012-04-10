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
        $content = $("<span>" + toEqnString(fun.coefs) + "</span>")
            .appendTo($parent)
            .keyup(handleKey)
            .mathquill("editable");
        lastLatexStr = $content.mathquill("latex");
    }

    function handleKey(e) {
        console.log("key");
        var newLatexStr = $content.mathquill("latex");
        if (newLatexStr !== lastLatexStr) {
            console.log('new latex', newLatexStr);
            var coefs = parser.parseAndSimplify(
                    latexToEqn(newLatexStr));
            if (coefs) {
                //me.broadcast("repChanged", { fun: fun, coefs: coefs });
                console.log("new coefs", coefs);
            } else {
                console.log("no parse for " + latexToEqn(newLatexStr));
            }
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
                return  (coef === 0) ? "" :
                        (coef === 1) ? xterm :
                                       coef + xterm ;
            })
            .compact().value()
            .join("+");
    }

    function latexToEqn(latexStr) {
        return latexStr.replace(/\\cdot/g, "*");
    }

    //console.log(toEqnString([0,1,2,0]));
    //console.log(toEqnString([0]));

    return me;
};
