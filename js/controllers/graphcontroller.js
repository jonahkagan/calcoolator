G.makeGraphController = function(model, p) {
    var controller = G.makeController(model);
    var dude = G.makeGraphDude(p);
    var reps = [];
    
    dude.subscribe("newFunction", controller.onNewFunction);
    
    controller.onUpdate = function(data) {
        console.log("updating views!");
        if (data && data.functions) {
            reps = [];
            dude.display();
            for (f in data.functions) {
                var repView = G.makeGraphRep(data.functions[f], p);
                repView.subscribe("selectFunction", controller.onSelectFunction);
                repView.display();
                reps.push(repView);
            }
        }
    }
    
    controller.onClick = function(data) {
        //select function
        model.selectFunction(null);
        if (data.mouseX && data.mouseY) {
            for (r in reps) {
                reps[r].select(data.mouseX, data.mouseY);
            }
        }
    }
    
    controller.onDrag = function(data) {
        //move anchor
        if (data.mouseX && data.mouseY) {
            for (r in reps) {
                if (reps[r].drag(data.mouseX, data.mouseY)) return;
            }
        }
    }
    
    controller.onPress = function(data) {
        //select anchor
        if (data.mouseX && data.mouseY) {
            for (r in reps) {
                if (reps[r].press(data.mouseX, data.mouseY)) return;
            }
        }
    }
    
    dude.subscribe("mouseClicked", controller.onClick);
    dude.subscribe("mouseDragged", controller.onDrag);
    dude.subscribe("mousePressed", controller.onPress);
    
    controller.endSuper();

    return controller;
};