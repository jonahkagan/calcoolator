G.makeTopbarController = function (model) {
    var me = G.makeController(model, "topbar");
    
/*    
    eqnDude.subscribe("newFunction", me.onNewFunction);
    eqnDude.subscribe("eqnSelected", me.onSelectFunction);
    eqnDude.subscribe("eqnRemoved", me.onRemoveFunction);
*/

    // TODO only redisplay one function at a time
    me.onUpdate = function (event) {
        var funs = event.functions;
        $("#topfuns").empty();
        _.each(funs, function(fun) {
            var view = G.makeTopbarView(fun);
            view.subscribe("funSelected", me.onSelectFunction);
            view.subscribe("funRemoved", me.onRemoveFunction);
            view.display($("#topfuns"));
        });
        
        $newfun = $(
            "<div id=\"newfun\">+</div>"
            )
            .appendTo($("#topfuns"))
            .click(function() {
                model.newFunction("topbar");
            });
    };

    return me;
};
