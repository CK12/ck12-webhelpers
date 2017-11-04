// adapted from Backbone.Events.
// intended to act as a stand-alone event pipe.
// Mix this into any object via $.extend( true, this, new Events() ); or how you prefer
//
// common uses:
// this.on('eventName', callbackFunction);
// this.off('eventName', functionPointer);
// this.trigger('eventName', data_0, data_1, data_2, ... , data_n);
/* global _ */
define(function() {
    return function Events () {
        /**
         * Return a function that executes only 1 time.
         * Subsequent calls return the result of the 1st execution.
         */
        function _once(callback) {
            var c = 0;
            var memo = null;
            return function() {
                if (c===0) {
                    return (c++, memo = callback.apply(this, arguments), memo);
                }
                else {
                    return memo;
                }
            };
        }

        /**
         * Return an array of all of the top-level keys of some object.
         */
        function _keys(object) {
            var keys = [];
            var prop;
            if (typeof object !== 'object') { return []; }
            for (prop in object) if (object.hasOwnProperty(prop)) {
                keys.push(prop);
            }
            return keys;
        }

        // store the events dict.
        var _events = {};

        var slice = Array.prototype.slice;

        var _Events = {

            // Bind an event to a `callback` function. Passing `"all"` will bind
            // the callback to all events fired.
            on: function(name, callback, context) {
                if (!eventsApi(this, 'on', name, [callback, context]) || !callback) { return this; }
                _events || (_events = {});
                var events = _events[name] || (_events[name] = []);
                events.push({callback: callback, context: context, ctx: context || this});
                return this;
            },

            // Bind an event to only be triggered a single time. After the first time
            // the callback is invoked, it will be removed.
            once: function(name, callback, context) {
                if (!eventsApi(this, 'once', name, [callback, context]) || !callback) { return this; }
                var self = this;
                var once = _once(function() {
                    self.off(name, once);
                    callback.apply(this, arguments);
                });
                once._callback = callback;
                return this.on(name, once, context);
            },

            // Remove one or many callbacks. If `context` is null, removes all
            // callbacks with that function. If `callback` is null, removes all
            // callbacks for the event. If `name` is null, removes all bound
            // callbacks for all events.
            off: function(name, callback, context) {
                var retain,  events, names;
                if (!_events || !eventsApi(this, 'off', name, [callback, context])) { return this; }
                if (!name && !callback && !context) {
                    _events = undefined;
                    return this;
                }
                names = name ? [name] : _keys(_events);
                //for (i = 0, l = names.length; i < l; i++)
                names.forEach(function(name) {
                    events = _events[name];
                    if (events) {
                        _events[name] = retain = [];
                        if (callback || context) {
                            events.forEach(function(ev) {
                                if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                                    (context && context !== ev.context))
                                {
                                    retain.push(ev);
                                }
                            });
                        }
                        if (!retain.length) { delete _events[name]; }
                    }
                });
                return this;
            },

            // Trigger one or many events, firing all bound callbacks. Callbacks are
            // passed the same arguments as `trigger` is, apart from the event name
            // (unless you're listening on `"all"`, which will cause your callback to
            // receive the true name of the event as the first argument).
            trigger: function(name) {
                if (!_events) { return this; }
                var args = slice.call(arguments, 1);
                if (!eventsApi(this, 'trigger', name, args)) { return this; }
                var events = _events[name];
                var allEvents = _events.all;
                if (events) { triggerEvents(events, args); }
                if (allEvents) { triggerEvents(allEvents, arguments); }
                return this;
            },

            // Tell this object to stop listening to either specific events ... or
            // to every object it's currently listening to.
            stopListening: function(obj, name, callback) {
                var listeningTo = this._listeningTo;
                if (!listeningTo) { return this; }
                var remove = !name && !callback;
                if (!callback && typeof name === 'object') { callback = this; }
                if (obj) { (listeningTo = {})[obj._listenId] = obj; }
                for (var id in listeningTo) {
                    obj = listeningTo[id];
                    obj.off(name, callback, this);
                    if (remove || _.isEmpty(obj._events)) { delete this._listeningTo[id]; }
                }
                return this;
            }

        };


        // Implement fancy features of the Events API such as multiple event
        // names `"change blur"` and jQuery-style event maps `{change: action}`
        // in terms of the existing API.
        var eventsApi = function(obj, action, name, rest) {
            // Regular expression used to split event strings.
            var eventSplitter = /\s+/;
            if (!name) { return true; }

            // Handle event maps.
            if (typeof name === 'object') {
                for (var key in name) {
                    obj[action].apply(obj, [key, name[key]].concat(rest));
                }
                return false;
            }

            // Handle space separated event names.
            if (eventSplitter.test(name)) {
                var names = name.split(eventSplitter);
                names.forEach(function(name) {
                    obj[action].apply(obj, [name].concat(rest));
                });
                return false;
            }

            return true;
        };

        // A difficult-to-believe, but optimized internal dispatch function for
        // triggering events. Tries to keep the usual cases speedy (most internal
        // Backbone events have 3 arguments).
        var triggerEvents = function(events, args) {
            var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
            switch (args.length) {
                case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
                case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
                case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
                case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
                default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
            }
        };

        return _Events;
    };
});
