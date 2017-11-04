define(function() {

    /**
     * Interface object for browser's localStorage
     */
    function LocalStorageInterface (config) {
        var dbName = config.db.name;

        /**
         * Save the argument to the dbName in localStorage
         */
        this.write = function(string) {
            localStorage[dbName] = string;
        };

        /**
         * Read a key's value from the localStorage
         * @returns Object or null. If the dbName points to an undefined location, then return null.
         */
        this.read = function() {
            if (undefined === localStorage[dbName]) { return null; }
            else {
                return localStorage[dbName];
            }
        };

        /**
         * @method
         * delete all data in the db 
         */
        this.dump = function() {
            delete localStorage[config.db.name];
        };
    }
    return LocalStorageInterface;
});
