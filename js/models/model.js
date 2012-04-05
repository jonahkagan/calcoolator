G.makeModel = function() {
    var model = {};
    var functions = [];
    var selectedFunction = null;
        
    model.newFunction = function() {
        console.log("model is making new function!");
        var fun = G.makeFun('f', [0, 1]);
        functions.push(fun);
        if (selectedFunction) selectedFunction.isSelected = false;
        fun.isSelected = true;
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