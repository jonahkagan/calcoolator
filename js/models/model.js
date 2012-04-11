G.makeModel = function() {
    var model = {};
    var functions = [];
    var selectedFunction = null;
        
    model.newFunction = function (srcRep) {
        var fun = G.makeFun('f', [0, 0, 1]);
        functions.push(fun);
        if (selectedFunction) selectedFunction.isSelected = false;
        fun.isSelected = true;
        selectedFunction = fun;
        G.eventManager.broadcast("modelChanged", {
            functions: functions,
            src: srcRep
        });
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
        G.eventManager.broadcast("modelChanged", {functions: functions});
    };
    
    model.changeFunction = function (updatedFun, srcRep) {
        G.eventManager.broadcast("modelChanged", {
            functions: functions,
            changedFun: updatedFun,
            src: srcRep
        });
    };
    
    return model;
}
