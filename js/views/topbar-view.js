G.makeTopbarView = function(fun) {
    var me = G.makeRepView(fun);
    
    var topbar = $('topbar');
    
    me.display = function($parent) {
        $content = $(
            "<div class=\"topfun\">" +
                "<span class=\"fun-name\">" + fun.name + "</span>" +
            "</div>"
            )
            .appendTo($parent)
            .click(function() {
                me.broadcast("funSelected", {fun: fun});
            });
            
            if (fun.isSelected) {
                $content.find(".fun-name").mathquill()
                    .css("background", fun.color.toCSS())
                    .css("color", "#fefefe")
                    .css("border", "none");
            }
            else {
                $content.find(".fun-name").mathquill()
                    .css("background", "#f6f8ec")
                    .css("color", fun.color.toCSS())
                    .css("border", "1px solid #eee");
            }

    }
    
    return me;
}