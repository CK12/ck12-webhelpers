define([
    "./utils/extend",
    "./storage/LocalStorageInterface"
], function(extend) {


    /**
     * An interface is an instantiable object that handles reads/writes to some 
     * type of DB. The idea is very similar to a java interface,
     * which has been implemented by a class.
     *
     * An interface is expected to implement the following methods:
     *
     * read
     * write
     * dump
     *
     * 
     * ---- method signatures ----
     *
     * read() 
     *      - returns the entire contents of the config.db.name, or null.
     * write(string) 
     *      - returns undefined
     * dump()
     *      - returns undefined
     *
     */

    /**
     * Driver class for saving data to a browser storage database. 
     *
     * This constructor will instantiate the proper INTERFACE. The interface should
     * implement methods (such as 'read', 'write', and 'dump') and handle manipulations to  
     * the database that it is implementing. For example, LocalStorageInterface implements 
     * the 'read' method, which 
     * Given some db.name, this constructor will use the instantiated interface, parse the 
     * existing db field as JSON, and cache the result as a local js object.
     *
     *
     * @constructor
     * @param {object} config - configuration object which extends or overwrites the defaults.
     */
    function Storage(config) {
        var interface = null;
        var model = {};
        var _old; // detect whether the cached model is out of sync with the db writes.
        config = (typeof config !== "object") ? {} : config;
        // extend default config with some user defined config object.
        config = extend(true, {
            "db": {
                "name": "dexterjs",
                "type": "localStorage"
            },
            "model": {
                "queue": []
            },
            "interface": "localStorage"
        }, config);


        // SETUP THE INTERFACE TO THE STORAGE OBJECT
        switch (config.interface) {
            default: 
                interface = new LocalStorageInterface(config);
        }

        /** 
         * @private 
         */
        function initialize () {
            this.read();
            model = extend(true, config.model, model);
            _old = false;
        }

        // warning, objects are passed by reference.
        this.set = function(key, val) {
            model[key] = val;
            _old = true;
        };

        this.get = function(key) {
            return model[key];
        };

        /**
         * @method
         * Write to storage via interface
         */
        this.save = function() {
            _old = false;
            interface.write( JSON.stringify(model) );
        };

        /** 
         * @method
         * Get interface string, parse it as JSON, and save the result as a local JS variable
         */
        this.read = function() {
            var buff = interface.read();
            if (buff === null) {
                return model;
            }
            else {
                model = JSON.parse(buff);
                return model;
            }
        };

        /**
         * Write key:value to the cached model and interface
         * Special Case: no arguments just causes a save.
         * @param {string} key points to the key in the db.
         * @param {string} value is the value associated with the key.
         */
        this.write = function() {
            if (arguments.length===0) { return this.save(); }
            this.set.apply(this, arguments);
            this.save();
        };

        /**
         * Append a value to the given data object specified by key.
         * If the key is undefined, then do a write. 
         * This method is intended to concatenate an existing array with a new array, but 
         * has fallbacks in case the value isn't really an array so the data isn't lost.
         * @method
         */
        this.append = function(key, value) {
            var _v = this.get(key);
            var _vt = typeof _v;

            // check if existing value is NOT an object
            if (_vt !== "object" || _vt === "undefined" || _vt === "boolean") {
                this.write.apply(this, arguments);
            }
            // the existing value could be an array...
            else if (_v instanceof Array ) {
                if (value instanceof Array) {
                    this.write(key, _v.concat(value)); // maintains a single array
                }
                else { 
                    // otherwise, just push the new object onto the existing array
                    _v.push(value);
                    this.write(key, _v); 
                }
            }
            // the existing value must be some object. In this case it's awkward to "append" an object
            // to another object, 
            else {
                console.warn("[Dexterjs] The value passed is an object literal!\nUsing the extend method instead of append.");
                this.extend(key, value);
            }
        };

        /**
         * Given a key that points to an object and a value that is an object, extend the existing objct
         * with the new value.
         * @method
         */
        this.extend = function(key, value) {
            this.write( key, extend(true, this.get(key), value) );
        };

        /**
         * Given a key that points to an integer (possible string), add 1 to the value and set the updated key
         * @method
         */
        this.increment = function(key) {
            this.set(key, parseInt(this.get(key)) + 1);
        };

        /**
         * DELETE ALL DATA IN THE INTERFACE !!!
         * DELETE CACHED STORAGE OBJECT!!!
         * @method
         */
        this.dump = function() {
            model = {};
            interface.dump();
        };

        initialize.call(this);
    }
    return Storage;
});
