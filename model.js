G.makeModel = function() {
    var model = {};
    var functions = [];
    
        
    model.newFunction = function() {
        console.log("model is making new function!");
        var fun = G.makeFun('f', [0, 1]);
        functions.push(fun);
        G.eventManager.broadcast("updateViews", {functions: functions});
    }
    
    model.removeFunction = function(fun) {
        
    }
    
    model.getFunctions = function() {
        
    };
    
    model.changeFunction = function(fun) {
        
    };
    
    return model;
}