function makeParser() {
    var me = {};

    var T = {
        OPERATOR: 'operator',
        NUMBER: 'number',
        ID: 'id',
        END: 'end'
    };

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
                return token(T.NUMBER, numStr);
            }
        }

        function scanOp() {
            if (/[\+\-\*\/\^\(\)]/.test(peek())) {
                return token(T.OPERATOR, next());
            }
        }

        function scanId() {
            var idStr = '';
            while (/\w/.test(peek())) {
                idStr += next();
            }
            if (idStr !== '') {
                return token(T.ID, idStr);
            }
        }

        return function () {
            skipSpaces();
            if (i >= eqnStr.length) {
                return token(T.END, '(end)');
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
            case T.NUMBER:
                tok.nud = function () {
                    return ast({ value: tok.value });
                };
                break;

            case T.ID:
                tok.nud = function () {
                    return ast({ id: tok.value });
                };
                break;

            case T.OPERATOR:
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
                            return exp;
                            /*
                            return ast({
                                type: tok.type,
                                operator: tok.value,
                                first: exp
                            });
                            */
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
            if (node.isNum()) {
                return node.value;
            } else if (node.isId()) {
                return node.id;
            } else if (node.second) {
                return '(' + node.first.toString() + node.operator +
                    node.second.toString() + ')';
            } else {
                return '(' + (node.operator === '(' ? '' :
                    node.operator) + node.first.toString() + ')';
            }
        };

        node.isNum = function () { return node.value !== undefined; }
        node.isOp = function () { return node.operator !== undefined; }
        node.isId = function () { return node.id !== undefined; }

        // x -> 1*x^1
        function addCoefs(n) {
            if (n.isId()) {
                return ast({
                    operator: '*',
                    first: ast({ value: 1 }),
                    second: ast({
                        operator: '^',
                        first: ast({ id: n.id }),
                        second: ast({ value: 1 })
                    })
                });
            } 
            if (n.first) { n.first = addCoefs(n.first); }
            if (n.second) { n.second = addCoefs(n.second); }
            return n;
        }

        node.simplify = function () {
            node = addCoefs(node);
            console.log(node.toString());
            return node.simp();
        }

        node.simp = function () {
            if (node.isOp()) {
                var first = node.first.simp(),
                    second = node.second ? node.second.simp() : null;
                if (first.isNum()) {
                    if (second && second.isNum()) {
                        var num;
                        first = parseFloat(first.value);
                        second = parseFloat(second.value);
                        switch (node.operator) {
                            case '+':
                               num = first + second; break;
                            case '-':
                               num = first - second; break;
                            case '*':
                               num = first * second; break;
                            case '/':
                               num = first / second; break;
                            case '^':
                               num = Math.pow(first, second); break;
                        }
                        return ast({ value: num });
                    } else if (!second && node.operator === '-') {
                        return ast({ value: -parseFloat(first.value) });
                    }
                }
                switch (node.operator) {
                    case '+':
                        // Collecting like terms
                        // a * x^n + b * x^n -> (a+b) * x^n
                        if (first.operator === '*' &&
                            second.operator === '*' &&
                            first.second.operator === '^' &&
                            second.second.operator === '^' &&
                            first.second.first.isId() &&
                            second.second.first.isId() &&
                            first.second.first.id === second.second.first.id &&
                            first.second.second.isNum() &&
                            second.second.second.isNum() &&
                            first.second.second.value === second.second.second.value)
                        {
                            return ast({
                                operator: '*',
                                first: ast({
                                    operator: '+',
                                    first: first.first,
                                    second: second.first
                                }),
                                second: first.second
                            }).simp();
                        }
                        break;
                    case '-':
                        // Canonical form: subtraction -> addition
                        // a - b -> a + (-b)
                        if (second) {
                            return ast({
                                operator: '+',
                                first: first,
                                second: ast({
                                    operator: '-',
                                    first: second
                                })
                            }).simp();
                        } else {
                            // Double negation
                            // -(-a) -> a
                            if (first.operator === '-' &&
                                !first.second)
                            {
                                return first.first;
                            }
                            // -(a*b) -> (-a) * b
                            if (first.operator === '*') {
                                return ast({
                                    operator: '*',
                                    first: ast({
                                        operator: '-',
                                        first: first.first
                                    }),
                                    second: first.second
                                }).simp();
                            }
                        }
                        break;

                    case '*':
                        // Canonical form: coef on left
                        // o * n -> n * o
                        if (second.isNum() && !first.isNum()) {
                            node.first = second;
                            node.second = first;
                            return node;
                        }

                        // Associativity/Commutativity
                        // (a * o) * b -> (a * b) * o
                        if (first.operator === '*' &&
                            first.first.isNum() &&
                            second.isNum())
                        {
                            return ast({
                                operator: '*',
                                first: ast({
                                    operator: '*',
                                    first: first.first,
                                    second: second
                                }),
                                second: first.second
                            }).simp();
                        }

                        // a * (b * o) -> (a * b) * o
                        if (second.operator === '*' &&
                            second.first.isNum() &&
                            first.isNum())
                        {
                            return ast({
                                operator: '*',
                                first: ast({
                                    operator: '*',
                                    first: first,
                                    second: second.first
                                }),
                                second: second.second
                            }).simp();
                        }

                        // Combining like terms
                        // (a*x^b) * (c*x^d) = (a*c) * x^(b+d)
                        if (first.operator === '*' &&
                            second.operator === '*' &&
                            first.second.operator === '^' &&
                            second.second.operator === '^' &&
                            first.second.first.isId() &&
                            second.second.first.isId() &&
                            first.second.first.id === second.second.first.id)
                        {
                            return ast({
                                operator: '*',
                                // (a*c)
                                first: ast({
                                    operator: '*',
                                    first: first.first,
                                    second: second.first
                                }),
                                // x^(b+d)
                                second: ast({
                                    operator: '^',
                                    first: first.second.first,
                                    second: ast({
                                        operator: '+',
                                        first: first.second.second,
                                        second: second.second.second
                                    })
                                })
                            }).simp();
                        }

                        break;

                    case '/':
                        return ast({
                            operator: '*',
                            first: first,
                            second: ast({
                                operator: '^',
                                first: second,
                                second: ast({ value: -1.0 })
                            })
                        }).simp();

                    case '^':
                        // Distribute exponent
                        // (a*b)^c -> a^c * b^c
                        if (first.operator === '*') {
                            return ast({
                                operator: '*',
                                first: ast({
                                    operator: '^',
                                    first: first.first,
                                    second: second
                                }),
                                second: ast({
                                    operator: '^',
                                    first: first.second,
                                    second: second
                                })
                            }).simp();
                        }

                        // Combine exponent
                        // (x^a)^b -> x^(a*b)
                        if (first.operator === '^' &&
                            first.first.isId())
                        {
                            return ast({
                                operator: '^',
                                first: first.first,
                                second: ast({
                                    operator: '*',
                                    first: first.second,
                                    second: second
                                })
                            }).simp();
                        }
                        break;
                            
                }
                node.first = first;
                if (second) { node.second = second; }
            }
            return node;
        };

        return node;
    }

    
    me.testParse = function (eqnStr) {
        try {
            return me.parse(eqnStr).simplify();
        } catch (e) {
            console.error(e);
            //throw e;
        }
        return { toString: function() {} };
    };

    return me;
}

var p = makeParser();

console.log(p.testParse('1 + 2').toString());
console.log(p.testParse('x^2').toString());
console.log(p.testParse('x * x^2').toString());
console.log(p.testParse('1 + 2*3^4*x').toString());
console.log(p.testParse('1 * x + 2 * x^2 / (x * 3)').toString());
console.log(p.testParse('1-x^2').toString());
console.log(p.testParse('x^(1+1)^2 + 3*x^3*(x+5*x^2)').toString());
/*
console.log(p.testParse('1 + 2 + 3').toString());
console.log(p.testParse('1 + 2 / 3').toString());
//console.log(p.testParse('1 + (2 + 3').toString());
//console.log(p.testParse('1 + (2 + (3)').toString());
console.log(p.testParse('1 + -2 + 3').toString());
console.log(p.testParse('1 + 3^4^5 + 6').toString());
*/
