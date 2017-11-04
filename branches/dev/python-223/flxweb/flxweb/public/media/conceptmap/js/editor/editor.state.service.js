define([
    'jquery',
    'conceptmap/graph/graph.helpers',
    'conceptmap/editor/editor.helpers',
    'conceptmap/user/user'
], function($, helpers, editorHelpers, user){

    function get(args){
        var dfd    = $.Deferred(),
            onFail = function(){ dfd.resolve(false); };

        setVisitorID(args);

        $.ajax({
            url: '/flx/get/concept/map/feedbacks',
            data: args,
            dataType: 'json'
        })
            .done(function(data){
                if(data.response.message){ return onFail(); }
                dfd.resolve( data.response.feedbacks );
            })
            .fail(onFail);

        return dfd.promise();
    }

    function create(args){
        return $.post('/flx/create/concept/map/feedbacks', args);
    }

    function update(args){
        return $.ajax('/flx/update/concept/map/feedbacks', {
            method: 'PUT',
            data: args
        });
    }

    function setup(fn){
        return function(args){
            setVisitorID(args);

            // Set suggestions to string
            args.suggestions = args.suggestions
                .filter(editorHelpers.isModified)
                .join(',');

            return fn(args);
        }
    }

    function setVisitorID(args){
        if(!user.get().isLoggedIn()){
            // Set visitorID
            args.visitorID = $.cookie('dexterjsVisitorID');
        }
    }

    return {
        get: get,
        create: setup(create),
        update: setup(update)
    };

});
