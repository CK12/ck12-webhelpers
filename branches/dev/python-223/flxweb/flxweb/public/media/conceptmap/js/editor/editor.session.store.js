define([

], function(){

    var sessionStore = {
        added: [],
        removed: []
    };

    function add(d) {
        this.push(d);
        return d;
    }

    function remove(d){
        var index = typeof d === 'number' ? d : this.indexOf(d),
            removed;

        if(index === -1){
            this.forEach(function(_d, i){
                if(_d.eid === d.eid){
                    index = i;
                }
            });
        }

        if(index !== -1){
            removed = this.splice(index, 1)[0];
        }

        return removed;
    }

    function undo(index){
        var removed = remove.call(sessionStore.removed, index);
        return add.call(sessionStore.added, removed);
    }

    function clear(){
        sessionStore = {
            added: [],
            removed: []
        };
    }

    function isEmpty(){
        return !sessionStore.added.length && !sessionStore.removed.length;
    }

    function setStoreContext(fn){
        return function(d){
            var stateType = typeof d === 'number' ? 'removed' : d.stateType;

            var store = sessionStore[stateType];
            if(!store){ return console.error('No store found for', d.stateType, d); } // Exit early

            return fn.apply(store, arguments);
        };
    }

    function get(){
        return sessionStore;
    }

    return {
        get: get,
        add: setStoreContext(add),
        remove: setStoreContext(remove),
        undo: undo,
        clear: clear,
        isEmpty: isEmpty
    };

});