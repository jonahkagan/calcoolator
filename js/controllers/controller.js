// interface for dude controller

G.makeController = function(model) {
    var controller = {};
    
    controller.onNewFunction = function() {
        model.newFunction();
    }
    
    controller.onRemoveFunction = function(data) {
        if (data && data.fun) {
           model.removeFunction(data.fun);
        }
    }

    controller.onRepChanged = function() {
        throw "onRepChanged not implemented!!!";
    }
    
    return controller;
};