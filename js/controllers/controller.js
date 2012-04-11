// interface for dude controller

G.makeController = function(model, name) {
    var controller = { name: name };
    G.eventManager.subscribe("modelChanged", function(data) {controller.onUpdate(data);});

    controller.onNewFunction = function () {
        model.newFunction(controller.name);
    };
    
    controller.onRemoveFunction = function(data) {
        if (data && data.fun) {
           model.removeFunction(data.fun, controller.name);
        }
    };
    
    controller.onSelectFunction = function(data) {
        if (data && data.fun) {
           model.selectFunction(data.fun, controller.name);
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
