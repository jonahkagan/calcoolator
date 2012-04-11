G.makeModel = function() {
    var model = {};
    var functions = [];
    var selectedFunction = null;
        
    model.newFunction = function() {
        var fun = G.makeFun('f', [0, 1]);
        functions.push(fun);
        if (selectedFunction) selectedFunction.isSelected = false;
        fun.isSelected = true;
        selectedFunction = fun;
        G.eventManager.broadcast("updateViews", {functions: functions});
    }
    
    model.removeFunction = function(fun) {
        
    }
    
    model.getFunctions = function() {
        
    };
    
    model.selectFunction = function(fun) {
        if (selectedFunction) {
            selectedFunction.isSelected = false;
        }
        if (fun) {
            fun.isSelected = true;
            selectedFunction = fun;
        }
        G.eventManager.broadcast("updateViews", {functions: functions});
    };
    
    model.changeFunction = function(fun, whichRep, repData) {
        fun.repChanged(whichRep, repData);
        G.eventManager.broadcast("updateViews", {functions: functions});
    };
    
    return model;
}