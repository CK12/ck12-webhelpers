define([
    'conceptmap/graph/graph.helpers',
    'conceptmap/editor/editor.session.store'
], function(helpers, editorSessionStore){

    function getSnapshot() {
        var data    = helpers.getData('editor'),
            removed = editorSessionStore.get().removed.map(function(removedNode){
                return removedNode.EID;
            }),
            eids    = data.dataset.graph.nodes.map(function(node){
                return node.EID;
            });

        return {
            removed: removed,
            eids: eids
        };
    }

    function getEidSnapshot() {
        var snapshot = getSnapshot();
        return snapshot.eids.concat(snapshot.removed);
    }

    return {
        get: getSnapshot,
        getEIDs: getEidSnapshot
    };

});