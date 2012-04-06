G = {};

G.makeEventManager = function() {
    var eventManager = {};

    var events = [];

    eventManager.subscribe = function(event, callback) {
        //console.log("subscribing to event: " + event);
        if (callback === undefined) {
            throw "cannot subscribe to event with undefined callback! event: " + event;
        }
        for (e in events) {
            if (events[e].name === event) {
                events[e].register(callback);
                return;
            }
        }
        event = makeEvent(event);
        event.register(callback);
        events.push(event);
    };

    eventManager.unsubscribe = function(event, callback) {
        // TODO
    };

    eventManager.broadcast = function(event, data) {
        //console.log("broadcasting event: " + event);
        for (e in events) {
            if (events[e].name === event) {
                events[e].fire(data);
            }
        }
    };

    function makeEvent(e) {
        var event = {
            name: e
        };
        var callbacks = [];

        event.register = function(callback) {
            for (c in callbacks) {
                if (callbacks[c] === callback) {
                    // callback already registered
                    return;
                }
            }
            callbacks.push(callback);
        };

        events.unregister = function(callback) {
            // TODO
        };

        event.fire = function(data) {
            for (c in callbacks) {
                callbacks[c](data);
            }
        };

        return event;
    }

    return eventManager;
};