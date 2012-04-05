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

    controller.onUpdate = function() {
        throw "onUpdate not implemented!!!";
    }
    
    // CALL THIS AT THE END OF SUBCLASS CONSTRUCTOR
    controller.endSuper = function() {
        G.eventManager.subscribe("updateViews", controller.onUpdate);
    };
    
    return controller;
};