G.makeFunEqnRep = function (fun) {
    var me = G.makeFunRep("eqn", fun);

    // The only data held in the eqn rep is the last eqn string typed
    // by the user (or generated from coefs after another rep changed).

    me.setRepFromCoefs = function (coefs) {
        // Don't actually need anything besides coefs yet
        // View will handle creating eqnStr, but we need to get rid of
        // the old one first 
        data.eqnStr = null;
    };

    // Should receive an eqn string ready to be parsed.
    // Returns null if there is no valid parse for the equation.
    me.getNewCoefsFromRep = function (eqnStr) {
        me.data.eqnStr = eqnStr;
        var coefs = parser.parseAndSimplify(eqnStr);
        if (coefs) {
            console.log("new coefs", coefs);
            return coefs;
        } else {
            console.log("no parse for " + eqnStr);
            return null;
        }
    };

    return me;
};
