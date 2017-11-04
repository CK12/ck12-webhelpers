define([
    'require',
    'exports',
    'conceptmap/graph/graph.helpers',
    'conceptmap/editor/editor.session.store',
    'conceptmap/editor/editor.session.undo.view',
    'conceptmap/editor/editor.session.snapshot',
    'conceptmap/editor/editor.widget',
    'conceptmap/editor/editor.element.manager'
], function(require, exports, helpers, editorSessionStore, editorSessionUndoView, editorSessionSnapshot, editorWidget, editorElementManager){

    var sessionBeginSnapshot;

    function begin(){
        sessionBeginSnapshot = editorSessionSnapshot.get();
    }

    function clear(){
        editorSessionStore.clear();
        editorSessionUndoView.clear();
        sessionBeginSnapshot = null;
    }

    function get(){
        return {
            startSnapshot: sessionBeginSnapshot,
            currentSnapshot: editorSessionSnapshot.get(),
            current: editorSessionStore.get()
        };
    }

///////////////
// Modifiers //
///////////////

    function add(d){
        d.stateType = 'added';
        editorSessionStore.add(d);
        checkDirty();
    }

    function remove(d){
        var isAdded = d.stateType === 'added';

        // Previously added - remove it
        if(isAdded){
            editorSessionStore.remove(d);
            return checkDirty();
        }

        d.stateType = 'removed';
        editorSessionUndoView.add(d);
        editorSessionStore.add(d);

        checkDirty();
    }

    function undo(index, args){
        var d = editorSessionStore.undo(index);
        if(args){ helpers.extend(d, args); }
        d.stateType = 'added';
        editorElementManager.add(d, args);
        // Reset the stateType otherwise undone items will have an add label on refresh
        d.stateType = null;
        checkDirty();
    }

//////////
// Sync //
//////////

    function syncRemoved(eids){
        eids.forEach(function(eid){
            var concept = helpers.clone( helpers.getConcept(eid) );

            concept.stateType = 'removed';
            editorSessionUndoView.add(concept);
            editorSessionStore.add(concept);
        });
    }

////////////////////
// Modified Check //
////////////////////

    function checkDirty(){
        if(isDirty()){
            editorWidget.broadcast('editorIsDirty');
        } else {
            editorWidget.broadcast('editorIsClean');
        }
    }

    function isDirty(){
        var currentSnapshot = editorSessionSnapshot.get(),
            currRemoved     = currentSnapshot.removed,
            currEids        = currentSnapshot.eids,
            filterRemove, filterEids;

        // Not the same length on either side, then it's dirty
        if(currEids.length !== sessionBeginSnapshot.eids.length ||
           currRemoved.length !== sessionBeginSnapshot.removed.length){ return true; }

        filterRemove = currRemoved.filter(function(eid){
            return sessionBeginSnapshot.removed.indexOf(eid) === -1;
        });

        filterEids = currEids.filter(function(eid){
            return sessionBeginSnapshot.eids.indexOf(eid) === -1;
        });

        return !!(filterRemove.length || filterEids.length);
    }

/////////////
// Exports //
/////////////

    exports.isDirty        = isDirty;
    exports.get            = get;
    exports.clear          = clear;
    exports.begin          = begin;
    exports.add            = add;
    exports.remove         = remove;
    exports.undo           = undo;
    exports.syncRemoved    = syncRemoved;

    exports.snapshot       = editorSessionSnapshot;

});