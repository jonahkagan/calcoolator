G.u = {

    // Partially applies f to args. I.e., if f takes n arguments,
    // then partial(f, args) takes n-args.length arguments and
    // is the same as calling f with args as the first arguments.
    partial: function (f, args) {
        return _.bind(f, f, args);
    },

    // Rounds a number to a certain number of places.
    round: function (places, num) {
        var digits = num.toFixed(places).split();
        while (digits[digits.length] === '0') {
            digits.pop();
        }
        return parseFloat(digits.join());
    },

    // Returns a function that rounds a number to the given number of
    // places.
    roundTo: function (places) {
        return G.u.partial(G.u.round, places);
    },

    // Finds the index of the first element in the list which passes
    // the test.
    indexOfWithTest: function (list, test) {
        for (var i = 0; i < list.length; i++) {
            if (test(list[i])) { return i; }
        } 
        return -1;
    },

    // Returns true if lst1 and lst2 have the same length and are
    // are pairwise equal according to the given equality test.
    listEquals: function (lst1, lst2, equals) {
        return lst1.length === lst2.length &&
            _.all(_.zip(lst1, lst2), function (pair) {
                return equals(pair[0], pair[1]);
            });
    },
    
};
