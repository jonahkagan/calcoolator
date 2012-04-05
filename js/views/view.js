// interfaces for dude view and rep view

G.makeDudeView = function() {
    var dudeView = {};
    
    dudeView.eventManager = G.makeEventManager();
    dudeView.subscribe = dudeView.eventManager.subscribe;
    dudeView.broadcast = dudeView.eventManager.broadcast;
    
    dudeView.display = function(functions) {
        throw "display not implemented!!";
    };

    return dudeView;
};

G.makeRepView = function(fun) {
    var rep = {
        fun: fun // need this?
    };
    
    rep.eventManager = G.makeEventManager();
    rep.subscribe = rep.eventManager.subscribe;
    rep.broadcast = rep.eventManager.broadcast;
    
    rep.display = function(fun) {
        throw "display not implemented!!";
    };
    
    return rep;
};