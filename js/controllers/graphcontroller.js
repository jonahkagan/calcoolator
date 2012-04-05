G.makeGraphController = function(model, p) {
    var controller = G.makeController(model);
    var dude = G.makeGraphDude(p);
    
    dude.subscribe("newFunction", controller.onNewFunction);
    
    controller.onUpdate = function(data) {
        if (data && data.functions) {
            dude.display();
            for (f in data.functions) {
                var repView = G.makeGraphRep(data.functions[f], p);
                repView.display();
            }
        }
    }
    
    controller.endSuper();

    return controller;
};