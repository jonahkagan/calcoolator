function makeEqnView() {
    var me = G.makeRepView();

    // Displays a text field with a function name f(x)
    // As the user types an equation, parses the equation
    // Also tries to simplify the equation if possible, and shows a
    // simplify button if it is possible
    //
    // Number coefficients in the equation are scrubbable

    me.display = function (fun, $parent) {

         
    }

    var $ed, $text, $display, eqnStr;
    function handleKey(e) {
        console.log("key");
        eqnStr = $text.val();
        $display.html(eqnToHTML(eqnStr));
        var coefs = parser.parseAndSimplify(eqnStr);
        $("#out").html(coefs ? coefs.toString() : "parse error");
    }

    function toEqnString(coefs) {
        _.reduceRight(coefs, function (coef) {
        }, "");
    }

    return me;
}
