define([
    'require',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.animation',
    'conceptmap/graph/graph.element.manager'
], function(require, helpers, animation, elementManager){

    function add(d, args){
        args = args || {};

        var editorData   = helpers.getData('editor'),
            nucleus      = helpers.getCurrentNucleus(editorData),
            eid          = helpers.isEID(d) ? d : d.EID,
            element;

        var editorEvents      = require('conceptmap/editor/editor.events'),
            editorElementStub = require('conceptmap/editor/editor.element.stub');

        element = elementManager.addToGroup(helpers.extend(
            {
                eid: eid,
                editor: true,
                force: editorEvents.force,
                coords: {
                    x: nucleus.x,
                    y: nucleus.y
                },
                cb: function(){
                    editorElementStub.addRemoveButton()
                        .call(animation.effects.fadeInScale, 150);

                    // TODO change bad element reference
                    if(!args.undo){
                        editorElementStub.createAddLabel(element);
                    }

                    editorEvents.bind();
                }
            },
            editorData
        ));

        return element;
    }

    return {
        add: add
    };
});