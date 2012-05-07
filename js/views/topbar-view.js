G.makeTopbarView = function(fun) {
    var me = G.makeRepView(fun);
    
    var topbar = $('topbar');
    
    me.display = function($parent) {
        $content = $(
            "<div class=\"topfun\">" +
                "<span class=\"fun-name\">" + fun.name + "</span>" +
                "<div class=\"remove\">X</div>" +
            "</div>"
            )
            .appendTo($parent)
            .click(function() {
                me.broadcast("funSelected", {fun: fun});
            });
            
        var $remove = $content.find(".remove")
            .hide()
            .click(function() {
                me.broadcast("funRemoved", {fun: fun});
            });

           $content.hover(function (e) { $remove.show(); },
                function (e) { $remove.hide(); });

            
            if (fun.isSelected) {
                $content.find(".fun-name").mathquill()
                    .css("background", fun.color.toCSS())
                    .css("color", "#fefefe")
                    .css("border", "none");
            }
            else {
                $content.find(".fun-name").mathquill()
                    .css("background", "#f4f4f4")
                    .css("color", fun.color.toCSS())
                    .css("border", "1px solid #eee");
            }
    }
    
    return me;
}