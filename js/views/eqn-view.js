function makeEqnEditor() {
    var me = G.makeRepView();

    // Displays a text field with a function name f(x)
    // As the user types an equation, parses the equation
    // Also tries to simplify the equation if possible, and shows a
    // simplify button if it is possible
    //
    // Number coefficients in the equation are scrubbable

    var $ed, $text, $display, eqnStr;

    (function init() {
        $ed = $(
            '<div class="eqneditor" tabindex="1">' +
                // Invisible text area catches keypresses
                '<textarea class="eqntext"></textarea>' +
                // which we display behind it
                '<div class="eqndisplay"></div>' +
            '</div>'
        )
        .keyup(handleKey);

        $text = $ed.find('.eqntext');
        $display = $ed.find('.eqndisplay');

        $ed.on('click', 'span', function (e) { console.log(e); });
    }());

    // Returns the JQuery object to be inserted into the DOM
    me.getContent = function () {
        return $ed;
    };

    function handleKey(e) {
        console.log('key');
        eqnStr = $text.val();
        $display.html(eqnToHTML(eqnStr));
        var coefs = parser.parseAndSimplify(eqnStr);
        $('#out').html(coefs ? coefs.toString() : 'parse error');
    }

    // Takes an eqn str and returns an HTML string
    // where each token in the eqn is represented by
    // an element.
    function eqnToHTML(eqnStr) {
        return _.map(parser.tokens(eqnStr),
            function (tok) {
                switch (tok.type) {
                    case parser.T.NUMBER:
                        return '<span class="num">' + tok.value +
                            '</span>';
                    case parser.T.OPERATOR:
                        return '<span class="op">' + tok.value +
                            '</span>';
                    case parser.T.ID:
                        return '<span class="id">' + tok.value +
                            '</span>';
                    case parser.T.BAD:
                        return '<span class="bad">' + tok.value +
                            '</span>';
                }
            }).join('');
    };

    return me;
}
