G.makeGraphController = function(model, p) {
    var controller = G.makeController(model);
    var dude = G.makeGraphDude(p);
    
    dude.subscribe("newFunction", controller.onNewFunction);
    
    controller.onRepChanged = function() {
        // TODO
    }

    return controller;
};