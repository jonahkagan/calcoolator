// interface for dude controller

G.makeController = function(model) {
    var controller = {};
    G.eventManager.subscribe("updateViews", function(data) {controller.onUpdate(data);});

    controller.onNewFunction = function() {
        model.newFunction();
    };
    
    controller.onRemoveFunction = function(data) {
        if (data && data.fun) {
           model.removeFunction(data.fun);
        }
    };
    
    controller.onSelectFunction = function(data) {
        if (data && data.fun) {
           model.selectFunction(data.fun);
        }
    };

    controller.onUpdate = function(data) {
        throw "onUpdate not implemented!!!";
    };
    
    controller.onRepChanged = function(data) {
        throw "onRepChanged not implemented!!!";
    };
    
    return controller;
};