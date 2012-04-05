G.makeFunRep = function(name, fun) {
    var rep = {
        name: name
    }
    
    rep.data = { };
    
    rep.setRepFromCoefs = function(coefs) {
        throw "setRepFromCoefs not implemented!!";
    };
    
    // MUST RETURN NEW COEFS
    rep.getNewCoefsFromRep = function(spec) {
        throw "getNewCoefs not implemented!!";
    }
    
    return rep;
}
