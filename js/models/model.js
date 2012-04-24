G.makeModel = function() {
    var model = {};
    var functions = [];
    var selectedFunction = null;
        
    model.newFunction = function (srcRep) {
        var fun = G.makeFun(newName(), [0, 1]);
        functions.push(fun);
        selectFun(fun);
        G.eventManager.broadcast("modelChanged", {
            functions: functions,
            src: srcRep
        });
    }

    // Create a new function name with increasing subscript each time
    // the function is called.
    var newName = (function () {;
        var funIdx = 1;
        return function () {
            return "f_{" + (funIdx++) + "}";
        };
    }());

    model.removeFunction = function(fun, srcRep) {
        if (fun === selectedFunction && functions.length > 1) {
            var i = _.indexOf(functions, fun) + 1;
            // Watch out for the end of the list
            selectFun(functions[i] || functions[i-2]);
        }
        functions = _.without(functions, fun);
        G.eventManager.broadcast("modelChanged", {
            functions: functions,
            src: srcRep
        });
    }
    
    model.getFunctions = function() {
        
    };
    
    model.selectFunction = function(fun, srcRep) {
        if (fun && !fun.isSelected) {
            selectFun(fun);
            G.eventManager.broadcast("modelChanged", {
                functions: functions,
                selectedFun: fun,
                src: srcRep
            });
        }
    };

    function selectFun(fun) {
        console.log("selecting", fun.name);
        if (selectedFunction) {
            selectedFunction.isSelected = false;
        }
        fun.isSelected = true;
        selectedFunction = fun;
    }
    
    model.changeFunction = function (updatedFun, srcRep) {
        G.eventManager.broadcast("modelChanged", {
            functions: functions,
            changedFun: updatedFun,
            src: srcRep
        });
    };
    
    return model;
}
