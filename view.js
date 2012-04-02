// interfaces for dude view and rep view

G.makeDudeView = function() {
    var dudeView = {};
    
    dudeView.eventManager = G.makeEventManager();
    dudeView.subscribe = dudeView.eventManager.subscribe;
    dudeView.broadcast = dudeView.eventManager.broadcast;
    
    dudeView.display = function(functions) {
        throw "display not implemented!!";
    };
    
    dudeView.onUpdate = function(data) {
        throw "onUpdate not implemented!!";
    };
    
    // CALL THIS AT THE END OF SUBCLASS CONSTRUCTOR
    dudeView.endSuper = function() {
        G.eventManager.subscribe("updateViews", dudeView.onUpdate);
    };

    return dudeView;
};

G.makeRepView = function() {
    var rep = {};
    
    rep.eventManager = G.makeEventManager();
    rep.subscribe = rep.eventManager.subscribe;
    rep.broadcast = rep.eventManager.broadcast;
    
    rep.display = function(fun) {
        throw "display not implemented!!";
    };
    
    return rep;
};