define([
    'conceptmap/graph/graph.helpers',
    'conceptmap/editor/editor.state.store',
    'conceptmap/editor/editor.state.service',
    'conceptmap/editor/editor.widget'
], function(helpers, editorStateStore, editorStateService, editorWidget){
    var isEdit;

    function get(args){
        var store = editorStateStore.get(args);

        if(store){
            isEdit = true;
            return store;
        }

        return editorStateService.get(args)
            .done(function(feedbacks){
                isEdit = !!(feedbacks instanceof Array && feedbacks.length);
                return feedbacks;
            });
    }

    function save(group, args){
        var suggestions = saveLocally(group, args),
            type        = isEdit ? 'update' : 'create';

        editorStateService[type]({
            encodedID: group.nucleus.EID,
            suggestions: suggestions,
            comments: editorWidget.getComments()
        });

        isEdit = null;
    }

    function saveLocally(group, args){
        return editorStateStore.add(group, args);
    }

    return {
        get: get,
        save: save,
        saveLocally: saveLocally
    };

});