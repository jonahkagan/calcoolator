function makeParser() {
    var me = {};

    function tokenize(eqnStr) {
        var i = 0;

        function peek() { return eqnStr.charAt(i); }
        function next() { var c = peek(i); i++; return c; }
        function token(t, v) { return { type: t, value: v }; }
        function skipSpaces() { while (/\s/.test(peek())) { next(); } }

        function scanNum() {
            var numStr = '';
            while (/[0-9]/.test(peek())) {
                numStr += next();
            }
            if (numStr !== '') {
                return token('number', numStr);
            }
        }

        function scanOp() {
            if (/[\+\-\*\/\^\(\)]/.test(peek())) {
                return token('operator', next());
            }
        }

        function scanId() {
            var idStr = '';
            while (/\w/.test(peek())) {
                idStr += next();
            }
            if (idStr !== '') {
                return token('id', idStr);
            }
        }

        return function () {
            skipSpaces();
            if (i >= eqnStr.length) {
                return token('end', '(end)');
            }
            return scanNum() || scanOp() || scanId() ||
                ('Bad token!' + peek());
        };
    }

    var infixOps = {
        '+': 10,
        '-': 10,
        '*': 20,
        '/': 20,
        '^': 30
    };
    var prefixOps = {
        '+': 100,
        '-': 100,
        '(': 0,
        ')': 0
    };

    var token, nextTok;

    me.parse = function (eqnStr) {
        console.log('parsing ' + eqnStr);
        nextTok = tokenize(eqnStr);
        next();
        return expression();
    };

    function expression(rbp) {
        var t = token, left;
        next();
        left = t.nud();
        rbp = rbp || 0;
        /*
        console.log('token ' + t.value + 
            ': rbp ' + rbp + ' < lbp ' + t.lbp + ' = ' + (rbp < t.lbp));
        console.log('token ' + token.value + 
            ': rbp ' + rbp + ' < lbp ' + token.lbp + ' = ' + (rbp < token.lbp));
        */
        while (rbp < token.lbp) {
            t = token;
            next();
            left = t.led(left);
        }
        return left;
    }

    function next() {
        var tok = nextTok();
        tok.lbp = 0;
        switch (tok.type) {
            case 'number':
            case 'id':
                tok.nud = function () {
                    return ast({
                        type: tok.type,
                        value: tok.value
                    });
                };
                break;

            case 'operator':
                var lbp = infixOps[tok.value];
                if (lbp !== undefined) {
                    tok.lbp = lbp; 
                    tok.led = function (left) {
                        return ast({
                            operator: tok.value,
                            first: left,
                            second: expression(tok.lbp)
                        });
                    };
                }

                var rbp = prefixOps[tok.value];
                if (rbp !== undefined) {
                    tok.nud = function () {
                        return ast({
                            operator: tok.value,
                            first: expression(rbp)
                        });
                    };
                }

                // Special case: make ^ right-assoc
                if (tok.value === '^') {
                    tok.led = function (left) {
                        return ast({
                            operator: tok.value,
                            first: left,
                            second: expression(tok.lbp-1)
                        });
                    };
                }

                // Special case: do paren matching
                if (tok.value === '(') {
                    tok.nud = function () {
                        var exp = expression(rbp);
                        if (token.value === ')') {
                            next();
                            return ast({
                                operator: tok.value,
                                first: exp
                            });
                        } 
                        throw "Unmatched parens";
                    };
                };
                            
                break;

            case 'end':
                tok.lbp = 0;
                break;
        }
        token = tok;
    }

    function ast(node) {
        node.toString = function () {
            if (node.value !== undefined) {
                return node.value;
            } else if (node.second) {
                return '(' + node.first.toString() + node.operator +
                    node.second.toString() + ')';
            } else {
                return '(' + (node.operator === '(' ? '' :
                    node.operator) + node.first.toString() + ')';
            }
        };
        return node;
    }
    
    me.testParse = function (eqnStr) {
        try {
            return me.parse(eqnStr);
        } catch (e) {
            console.error(e);
        }
        return { toString: function() {} };
    };

    return me;
}

var p = makeParser();
console.log(p.testParse('1 + 2').toString());
console.log(p.testParse('1 + 2*3^4*x').toString());
console.log(p.testParse('1 + 2 + 3').toString());
console.log(p.testParse('1 + (2 + 3').toString());
console.log(p.testParse('1 + (2 + (3)').toString());
console.log(p.testParse('1 + -2 + 3').toString());
console.log(p.testParse('1 + 3^4^5 + 6').toString());
