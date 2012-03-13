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

            case 'end':
                tok.lbp = 0;
                break;
        }
        token = tok;
    }

    /* AST simplification */

    function simplify(node) {
        console.log(node.toString());
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

    function fold(f, res, arr) {
        for (var i = 0; i < arr.length; i++) {
            res = f(res, arr[i]);
        }
        return res;
    }

    // Compute all operations on numbers
    simpFuns.push(function (node) {
        if (node.is('op')) {
            // The kid list will be sorted such that numbers are first
            var i = indexOfMatch(node.kids, function (n) {
                return !n.is('num');
            });
            if (i > 1) { // Need two numbers to combine
                var nums = node.kids.slice(0, i).map(function (node) {
                        return parseFloat(node.num);
                    }),
                    rest = node.kids.slice(i),
                    total;

                switch (node.op) {
                    case '+':
                        total = fold(function (res, n) {
                            return res += n;
                        }, 0, nums);
                        break;
                    case '*':
                        total = fold(function (res, n) {
                            return res *= n;
                        }, 1, nums);
                        break;
                    case '^':
                        // We cheat here and assume left-associativity
                        // since (^) nodes only ever have 2 kids
                        total = fold(function (res, n) {
                            return Math.pow(res, n);
                        }, nums[0], nums.slice(1));
                        break;
                }

                if (total !== undefined) {
                    if (rest.length > 0) {
                        return op(node.op, [num(total)].concat(rest));
                    } else {
                        return num(total);
                    }
                }
            }
        }
        return node;
    });

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

    function compareTerms(n1, n2) {
        if (n1.op === '*' &&
           n1.kids[1].op === '^' &&
           n1.kids[1].kids[0].is('id'))
        {
            if (n2.op === '*' &&
                n2.kids[1].op === '^' &&
                n2.kids[1].kids[0].is('id'))
            {
                var c = compare(n1.kids[1].kids[0].id,
                                n2.kids[1].kids[0].id);
                if (c === 0 &&
                    n1.kids[1].kids[1].is('num') &&
                    n2.kids[1].kids[1].is('num'))
                {
                    return compare(n1.kids[1].kids[1].num,
                                   n2.kids[1].kids[1].num);
                } else { return c; }
            }
        }
        return null;
    }

    function compareNodes(n1, n2) {
        if (n1.is('num')) {
            if (n2.is('num')) {
                return compare(n1.num, n2.num);
            } else {
                // Nums come first
                return -1;
            }
        } else if (n2.is('num')) {
            // Nums come first
            return 1;
        } else {
            var c = compareTerms(n1, n2);
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

    // Collect like terms for commutative operators 
    simpFuns.push(function (node) {
        if (node.op === '+' || node.op === '*') {
                //logList(node.kids);
            if (!isSorted(node.kids, compareNodes)) {
                node.kids.sort(compareNodes);
                //logList(node.kids);
                return op(node.op, node.kids);
            }
        }
        return node;
    });

    var depth = 0;
    function simp(node) {
        //if (depth > 10) { return node; }
        if (node.changed) {
            node.changed = false;
            if (node.is('op')) {
                node.kids = node.kids.map(simp);
                for (var i = 0; i < simpFuns.length; i++) {
                    node = simpFuns[i](node);
                };
            }
            depth += 1;
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
        var node = ast({ type: 'num', num: num });
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
        node.changed = true;
        node.is = function (type) { return node.type === type; }
        return node;
    }
        
        /*
        // TODO convert to children list for +,* to do commutativity
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

                        // Distribution
                        // a*(b+c) -> a*b + a*c
                        if (second.operator === '+') {
                            return ast({
                                operator: '+',
                                first: ast({
                                    operator: '*',
                                    first: first,
                                    second: second.first
                                }),
                                second: ast({
                                    operator: '*',
                                    first: first,
                                    second: second.second
                                })
                            }).simp();
                        }

                        // (a+b)*c -> a*c + b*c
                        if (first.operator === '+') {
                            return ast({
                                operator: '+',
                                first: ast({
                                    operator: '*',
                                    first: first.first,
                                    second: second
                                }),
                                second: ast({
                                    operator: '*',
                                    first: first.second,
                                    second: second
                                })
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
        */

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

var p = makeParser();

console.log(p.testParse('1 + 2').toString());
console.log(p.testParse('1 + 2 + 3').toString());
console.log(p.testParse('1 - 2').toString());
console.log(p.testParse('1 + -2 + 3').toString());
console.log(p.testParse('x^2').toString());
console.log(p.testParse('x * x^2').toString());
console.log(p.testParse('1 + 2*3^4*x').toString());
console.log(p.testParse('1 + 3^4^5 + 6').toString());
/*
console.log(p.testParse('1 * x + 2 * x^2 / (x * 3)').toString());
console.log(p.testParse('1-x^2').toString());
console.log(p.testParse('(x+1)*(x+2)').toString());
console.log(p.testParse('x^(1+1)^2 + 3*x^3*(x+5*x^2)').toString());
console.log(p.testParse('1 + 2 + 3').toString());
console.log(p.testParse('1 + 2 / 3').toString());
//console.log(p.testParse('1 + (2 + 3').toString());
//console.log(p.testParse('1 + (2 + (3)').toString());
console.log(p.testParse('1 + 3^4^5 + 6').toString());
*/
