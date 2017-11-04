define(function() {

    /**
     * @deprecated (not used now -- intended to validate other interfaces)
     *
     * @factory
     *
     * @param Interface implements the interface between the storage driver and browser storage. 
     * @param config passed as a configuration object to the new Interface.
     */ 
    function BaseStorageInterfaceFactory (Interface, config) {

        var prototypeMethods = ["write", "read"];

        if ( this !== (function() { return this; })() ) {
            throw new Error("BaseStorageInterfaceFactory is not a constructor, remove the 'new'");
        }

        prototypeMethods.every(function(method, idx, self) {
            if (typeof Interface.prototype[method] !== "function") {
                console.error("Interface must implement "+method+" in its prototype!");
                return false;
            } else { return true; }
        });

        return new Interface(config);
    }

    return BaseStorageInterfaceFactory;

});
