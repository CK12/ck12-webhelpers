define(
    [
        "../../var/default_configuration",
        "../../utils/extend"
    ], function(default_configuration, extend) {


    /**
     * Create a queue object, or absorb an existing queue object, and configure an instance of dexterjs
     * to be used by the queue
     */
    return function dexterQueue(global) {
        var dexter; // reserved for output of dexterjs
        var config; // reserved for dexter.get();
        var dexterQueueName = default_configuration.dexterQueueName;
        global = (global) ? global : (window || this);
        var queue = global[dexterQueueName] || [];

        // Terminal condition.. user defined object isn't an array
        if (!(queue instanceof Array)) {
            console.error(dexterQueueName+" isn't an array");
            return false;
        }
        // See if queue has a config object on it
        if (queue.hasOwnProperty("config")) {
            for (var c in queue.config) {
                dexterjs.set("config:"+c, queue.config[c]);
            }
            dexter = dexterjs(queue.config);
        }
        else {
            dexter = dexterjs();
        }
        // TESTS COMPLETE!

        extend(true, queue, dexter);

        config = dexter.get("config");

        queue.autoFlush = config.dexterQueueAutoFlush;
        
        /**
         * @method - push events onto the queue
         */
        queue.push = function() {
            Array.prototype.push.apply(this, arguments);
            if (this.autoFlush) {
                this.flush();
            }
        };

        /**
         * Clear queue, send all events to dexter backend
         * TODO: bulk upload
         */
        queue.flush = function() {
            var event;
            while (this.length) {
                event = this.pop();
                this.logEvent(event.eventName, event.payload);
            }
        };

        global[dexterQueueName] = queue;

        return queue;
    };

});
