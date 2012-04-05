G.makeParser = function() {
    var me = {};

    // Max exponent to expand parenthesized polynomials
    // i.e., max val of a for which we perform the expansion:
    // (x + ...)^a -> (x + ...)*(x + ...)^(a-1)
    var EXPANSION_LIMIT = 10;

    // Token types
    var T = {
        OPERATOR: 'operator',
        NUMBER: 'number',
        ID: 'id',
        END: 'end'
    };

    // Operator precedence values for parsing
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

    // Takes an equation string using the above operators
    // and tries to simplify it to canonical polynomial form.
    // If successful, returns a list of the coefficients.
    // Otherwise, returns a parse tree.
    // (Unless everything goes wrong, in which case returns 
    // undefined)
    me.parseAndSimplify = function (eqnStr) {
        if (eqnStr === '') {
            return [];
        }
        try {
            var ast = parse(eqnStr);
            return ast2coefs(ast) || ast;
        } catch (e) {
            console.log(e);
        }
    };

    function ast2coefs(origAst) {
        // If simplification yields canonical form,
        // convert to coef list
        var ast = simplify(origAst), coefs = [];
        // a
        if (ast.is('num')) {
            return [ parseFloat(ast.num) ];
        // a*x^n
        } else if (isTermWithCoef(ast)) {
            for (var i = 0; i < ast.kids[1].kids[1].num; i++) {
                coefs.push(0);
            }
            coefs.push(parseFloat(ast.kids[0].num));
            return coefs;
        // a + b*x + c*x^2 + ...
        } else if (ast.op === '+') {
            // check for constant term
            var i;
            if (ast.kids[0].is('num')) {
                coefs.push(parseFloat(ast.kids[0].num));
                i = 1;
            } else {
                coefs.push(0);
                i = 0;
            }
            console.log(ast.toString());
            // check higher order terms
            var exp = i; // exponent of cur term
            for (; i < ast.kids.length; i++) {
                if (isTermWithCoef(ast.kids[i])) {
                    // insert 0s for missing terms
                    for (; exp < ast.kids[i].kids[1].kids[1].num; exp++) {
                        coefs.push(0);
                    }
                    coefs.push(parseFloat(ast.kids[i].kids[0].num));
                    exp++;
                } else {
                    return null;
                }
            }
            return coefs;
        }
        return null;
    }

    var token, nextTok;
    function parse (eqnStr) {
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
                    return num(tok.value);
                };
                break;

            case T.ID:
                tok.nud = function () {
                    return id(tok.value);
                };
                break;

            case T.OPERATOR:
                var lbp = infixOps[tok.value];
                if (lbp !== undefined) {
                    tok.lbp = lbp; 
                    tok.led = function (left) {
                        return op(tok.value, [
                            left,
                            expression(tok.lbp)
                        ]);
                    };
                }

                var rbp = prefixOps[tok.value];
                if (rbp !== undefined) {
                    tok.nud = function () {
                        return op(tok.value, [expression(rbp)]);
                    };
                }

                // Special case: make ^ right-assoc
                if (tok.value === '^') {
                    tok.led = function (left) {
                        return op(tok.value, [
                            left,
                            expression(tok.lbp-1)
                        ]);
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

            case T.END:
                tok.lbp = 0;
                break;
        }
        token = tok;
    }

    /* AST simplification */

    function simplify(node) {
        return simp(addCoefs(node));
    }

    // x -> 1*x^1
    function addCoefs(node) {
        if (node.is('id')) {
            return op('*', [
                num(1), 
                op('^', [ id(node.id), num(1) ])
            ]);
        } else if (node.kids) {
            node.kids = node.kids.map(addCoefs);
        }
        return node;
    }

    var simpFuns = [];

    // Convert all subtraction and negation operations
    simpFuns.push(function (node) {
        if (node.op === '-') {
            // -a -> -1 * a
            if (node.kids.length === 1) {
                return op('*', [num(-1), node.kids[0]]);
            // a - b -> a + (-1 * b)
            } else {
                return op('+', node.kids.map(function(kid, i) {
                    if (i === 0) {
                        return kid;
                    } else {
                        return op('*', [num(-1), kid]);
                    }
                }));
            }
        }
        return node;
    });

    function indexOfMatch(arr, test) {
        for (var i = 0; i < arr.length; i++) {
            if (test(arr[i])) {
                return i;
            }
        }
        return i;
    }

    // Flatten addition and multiplication
    simpFuns.push(function (node) {
        if (node.op === '+' || node.op === '*') {
            var newKids = [];
            for (var i = 0; i < node.kids.length; i++) {
                if (node.kids[i].op === node.op) {
                    newKids = newKids.concat(node.kids[i].kids);
                } else {
                    newKids.push(node.kids[i]);
                }
            }
            if (newKids.length > node.kids.length) {
                return op(node.op, newKids);
            }
        }
        return node;
    });

    // Distribute multiplication over addition
    simpFuns.push(function (node) {
        if (node.op === '*') {
            var newKids = [node.kids[0]], changed;
            for (var i = 1; i < node.kids.length; i++) {
                var lastTerm = newKids.pop(),
                    curTerm = node.kids[i];

                // (b+...+c)*a -> b*a + ... + c*a
                if (lastTerm.op === '+') {
                    newKids.push(op('+',
                        lastTerm.kids.map(function (kid) {
                            return op('*', [kid, curTerm]);
                        })
                    ));
                    changed = true;
                // a*(b+...+c) -> a*b + ... + a*c
                } else if (curTerm.op === '+') {
                    newKids.push(op('+',
                        curTerm.kids.map(function (kid) {
                            return op('*', [lastTerm, kid]);
                        })
                    ));
                    changed = true;
                } else {
                    newKids.push(lastTerm);
                    newKids.push(curTerm);
                }
            }

            if (changed) {
                if (newKids.length === 1) {
                    return newKids[0];
                } else {
                    return op(node.op, newKids);
                }
            }
        }
        return node;
    });

    // Convert division to multiplication
    simpFuns.push(function (node) {
        // a / b -> a * b^-1
        if (node.op === '/') {
            return op('*', [
                node.kids[0],
                op('^', [node.kids[1], num(-1)])
            ]);
        }
        return node;
    });

    // Expand exponentiated expressions
    simpFuns.push(function (node) {
        if (node.op === '^') {
            var base = node.kids[0],
                exp = node.kids[1];
            if (base.op === '+' && exp.is('num')) {
                // (x + ...)^c -> (x + ...)*(x + ...)^(c-1)
                var ex = parseFloat(exp.num);
                if (1 < ex && ex <= EXPANSION_LIMIT) {
                    return op('*', [
                        base,
                        op('^', [
                           base,
                           op('-', [exp, num(1)])
                        ])
                    ]);
                }
            }
        }
        return node;
    });

    // Exponentation by 0,1
    simpFuns.push(function (node) {
        if (node.op === '^' && node.kids[1].is('num')) {
            // a^0 -> 1
            if (node.kids[1].num === '0') {
                return num(1);
            // a ^ 1 -> 1
            } else if (node.kids[1].num === '1' &&
                !node.kids[0].is('id'))
            {
                return node.kids[0];
            }
        }
        return node;
    });

    // Exponentiate numbers
    simpFuns.push(function (node) {
        if (node.op === '^' &&
            node.kids[0].is('num') &&
            node.kids[1].is('num'))
        {
            return num(Math.pow(
                parseFloat(node.kids[0].num),
                parseFloat(node.kids[1].num))
            );
        }
        return node;
    });

    // Distribute exponent
    // (a*b)^c -> a^c * b^c
    simpFuns.push(function (node) {
        if (node.op === '^' &&
            node.kids[0].op === '*')
        {
            return op('*', [
                op('^', [node.kids[0].kids[0], node.kids[1]]),
                op('^', [node.kids[0].kids[1], node.kids[1]])
            ]);
        }
        return node;
    });

    // Combine exponents
    // (x^a)^b -> x^(a*b)
    simpFuns.push(function (node) {
        if (node.op === '^' &&
            node.kids[0].op === '^')
        {
            return op('^', [
                node.kids[0].kids[0],
                op('*', [node.kids[0].kids[1], node.kids[1]])
            ]);
        }
        return node;
    });

    // Collect and combine like terms for commutative operators 
    simpFuns.push(function (node) {
        if (node.op === '+' || node.op === '*') {
            // Sort like terms together if we need to
            if (!isSorted(node.kids, compareNodes)) {
                node.kids.sort(compareNodes);
                node = op(node.op, node.kids);
            }

            // Combine adjacent like terms
            var newKids = [node.kids[0]];
            for (var i = 1; i < node.kids.length; i++) {
                var lastTerm = newKids.pop(),
                    curTerm = node.kids[i], 
                    newTerm = combine(node.op, lastTerm, curTerm);
                if (newTerm) {
                    newKids.push(newTerm);
                } else {
                    newKids.push(lastTerm);
                    newKids.push(curTerm);
                }
            } 
            if (newKids.length === 1) {
                return newKids[0];
            } else if (newKids.length < node.kids.length) {
                return op(node.op, newKids);
            }
        }
        return node;
    });

    // Emulate built-in JS compare
    function compare(v1, v2) {
        if (v1 < v2) {
            return -1;
        } else if (v1 > v2) {
            return 1;
        } else if (v1 === v2) {
            return 0;
        }
        throw 'Bad compare: ' + v1 + ', ' + v2;
    }

    // returns true if form is x^a
    function isTerm(n) {
        return n.op === '^' &&
            n.kids[0].is('id');
    }

    // returns true if form is a*x^c
    function isTermWithCoef(n) {
        return n.op === '*' &&
            n.kids[1].op === '^' &&
            n.kids[1].kids[0].is('id');
    }

    // given x^a, y^b, returns true if x = y
    function compareIds(n1, n2) {
        return compare(n1.kids[0].id,
                       n2.kids[0].id);
    }

    // given x^a, y^b, returns 0 if a === b
    function compareExps(n1, n2) {
        return compareNodes(n1.kids[1], n2.kids[1]);
    }

    // returns 0 if n1, n2 of the form x^a, x^b
    function likeTerms(n1, n2) {
        if (isTerm(n1) && isTerm(n2)) {
            return compareIds(n1, n2);
        }
        return null;
    }

    // returns 0 if n1, n2 of the form x^a, x^a
    function compareTerms(n1, n2) {
        var lt = likeTerms(n1, n2);
        if (lt === 0) {
            return compareExps(n1, n2);
        }
        return lt;
    }

    // returns 0 if n1, n2 of the form a*x^c, b*x^c
    function likeTermsWithCoefs(n1, n2) {
        if (isTermWithCoef(n1) && isTermWithCoef(n2)) {
            return compareTerms(n1.kids[1], n2.kids[1]);
        }
        return null;
    }

    // returns 0 if n1, n2 of the form a*x^c, b*x^c
    function compareTermsWithCoefs(n1, n2) {
        var lt = likeTermsWithCoefs(n1, n2);
        if (lt === 0) { // Compare coefs
            return compareNodes(n1.kids[0], n2.kids[0]);
        }
        return lt;
    }

    function compareNodes(n1, n2) {
        if (n1.is('num')) {
            if (n2.is('num')) {
                return compare(parseFloat(n1.num),
                               parseFloat(n2.num));
            } else {
                // Nums come first
                return -1;
            }
        } else if (n2.is('num')) {
            // Nums come first
            return 1;
        } else {
            var c = compareTermsWithCoefs(n1, n2);
            if (c === null) {
                c = compareTerms(n1, n2);
            }
            if (c !== null) { return c; }
        }
        return compare(n1, n2);
    }

    function isSorted(arr, cmp) {
        var cur = arr[0], prev;
        for (var i = 1; i < arr.length; i++) {
            prev = cur;
            cur = arr[i];
            if (cmp(prev, cur) > 0) {
                return false;
            }
        }
        return true;
    }

    function combine(oper, n1, n2) {
        if (n1.is('num') && n2.is('num')) {
            switch (oper) {
                case '+':
                    return num(parseFloat(n1.num) +
                               parseFloat(n2.num));
                case '*':
                    return num(parseFloat(n1.num) *
                               parseFloat(n2.num));
            }
        } else if (oper === '+' &&
                   likeTermsWithCoefs(n1, n2) === 0)
        {
            // a*x^c + b*x^c -> (a+b)*x^c
            return op('*', [
                op('+', [n1.kids[0], n2.kids[0]]),
                n1.kids[1]
            ]);
        } else if (oper === '*' &&
                   likeTerms(n1, n2) === 0)
        {
            // x^a * x^b -> x^(a*b)
            return op('^', [
                n1.kids[0],
                op('+', [n1.kids[1], n2.kids[1]])
            ]);
        }
        return null;
    }


    //var depth = 0;
    function simp(node) {
        //if (depth > 45) { return node; }
        if (!node.simplified) {
            node.simplified = true;
            if (node.is('op')) {
                node.kids = node.kids.map(simp);
                for (var i = 0; i < simpFuns.length; i++) {
                    node = simpFuns[i](node);
                    //console.log(node.toString());
                };
            }
            //console.log(node.toString());
            //depth += 1;
            node = simp(node);
        }
        return node;
    };

    function id(id) { 
        var node = ast({ type: 'id', id: id });
        node.toString = function () { return node.id; }
        return node;
    }

    function num(num) { 
        var node = ast({ type: 'num', num: num + '' });
        node.toString = function () { return node.num; }
        return node;
    }

    function op(op, kids) { 
        var node = ast({ type: 'op', op: op, kids: kids });
        node.toString = function () {
            if (node.kids.length === 1) {
                return '(' + node.op + node.kids[0] + ')';
            } else {
                return '(' + node.kids.join(node.op) + ')';
            }
        };
        return node;
    }

    function ast(node) {
        node.simplified = false;
        node.is = function (type) { return node.type === type; }
        return node;
    }

    function tokenize(eqnStr) {
        var i = 0;

        function peek() { return eqnStr.charAt(i); }
        function next() { var c = peek(i); i++; return c; }
        function token(t, v) { return { type: t, value: v }; }
        function skipSpaces() { while (/\s/.test(peek())) { next(); } }

        function scanNum() {
            var numStr = '', seenDecimal = false;
            while (/[0-9\.]/.test(peek())) {
                numStr += next();
                if (peek() === '.') {
                    if (seenDecimal) {
                        break;
                    } else {
                        seenDecimal = true;
                    }
                }
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

    function logList(nodes) {
        console.log(nodes.map(function(n) { return n.toString(); }).join(','));
    }

    me.testParse = function (eqnStr) {
        try {
            return simplify(me.parse(eqnStr));
        } catch (e) {
            console.error(e);
            throw e;
        }
        return { toString: function() {} };
    };

    return me;
}

var p = G.makeParser();

function test(eqn) { 
    //console.log(p.testParse(eqn).toString());
    var res = p.parseAndSimplify(eqn);
    if (res.type) {
        console.log(res.toString());
    } else {
        console.log(res);
    }
    console.log('#####################');
}

test('x^2 + 1');
/*
test('1 * x + 2 * x^2 / (x * 3)');
test('x^(1+1)^2 + 3*x^3*(x+5*x^2)');
test('3/(x+1)^3');
test('(x + 1)^3');
test('(x + 1)^10');
test('(x + 1)^11');
test('1 + 2');
test('1 + 2 + 3');
test('1 - 2');
test('1 + -2 + 3');
test('x^2');
test('x * x^2');
test('1 + 2*3^4*x');
test('1 + 3^4^5 + 6');
test('x^2 + x^2');
test('1-x^2');
test('(x+1)*(x+2)');
test('(x+1)*(x+2)*(x+1)');
test('1 + 2 + 3');
test('1 + 2 / 3');
//test('1 + (2 + 3');
//test('1 + (2 + (3)');
test('1 + 3^4^5 + 6');
*/
