define([
    'jquery',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.data'
], function($, helpers, data){

    function updateTitle(params){
        var $title = $('head title'),
            currentTitle = $title.text(),
            newTitle;

        newTitle = params.join(' | ');
        $title.text(newTitle + ' | ' + currentTitle);
    }


    function init(params){
        var concept = data.subjects[params.eid];

        if(!concept) { return console.warn(params.eid + ' is not currently available in the Concept Map'); }

        var subject     = helpers.getSubject(params.eid),
            conceptName = concept.name;

        updateTitle([conceptName, subject]);
    }

    return {
        init: init
    };
});