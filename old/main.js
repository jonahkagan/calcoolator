G.init = function(p) {
    var funMaster = G.makeFunMaster(p);
    G.funMaster = funMaster; // temporary
    G.parser = G.makeParser();  
    G.graph = G.makeGraph(p, funMaster);
    G.eqnInput = document.getElementById('eqn');
    G.eqnInput.onchange = G.readTemporaryInput;
    G.readTemporaryInput();
};

G.makeFunMaster = function(p) {
    var funMaster = {
        functions: [],
        selectedFunction: null
    };
    
    var graph; //other shits
    
    funMaster.setGraph = function(g) {
        graph = g;
    };
    
    funMaster.getNextFunctionColor = function() {
        // replace with something smart, k?
        return p.color(p.random(255), p.random(255), p.random(255));
    };
    
    // spec:
    //  coefs
    //  points
    funMaster.newFunction = function(spec) {
        var name = 'f'; // something else
        G.selectedFunction = G.makeFun(name, coefs);
    }
    
    funMaster.updateAll = function(fun) {
        graph.draw();
    };
    
    return funMaster;
};

G.readTemporaryInput = function() {
    var coefs = G.parser.parseAndSimplify(G.eqnInput.value);
    if (coefs && coefs.length) { // TODO find better way to check for array
        G.selectedFunction = G.makeFun('f', coefs);

        G.functions.push(G.selectedFunction);
        G.graph.draw(G.functions);
    }
}
    
G.writeTemporaryInput = function() {
    G.eqnInput.value = G.selectedFunction.toEqnString();
}
    

G.die = function(msg, obj) { console.log(msg); }





