define([
    'jquery',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.data.manager',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.events',
    'conceptmap/graph/graph.position',
    'conceptmap/graph/graph.animation',
    'conceptmap/graph/popup/graph.popup'
], function($, elements, helpers, data, dataManager,  config, events, position, animation, popup){

    function addToGroup(args){
        if(!helpers.isEID(args.eid)) { throw Error('No eid provided.'); }

        var groupIndex   = helpers.isNum(args.groupIndex) ? args.groupIndex : args.dataset.groups.length - 1,
            currentGroup = helpers.getSelectedGroup(groupIndex, args),
            positionType, repositionNodes, force;

        var concept = dataManager.add(args.eid,
            helpers.extend({
                group: currentGroup,
                groupIndex: groupIndex,
                cardinality: currentGroup.nodes.length,
                nucleus: currentGroup.nucleus
            },
            args
        ));

        positionType = groupIndex === 0 ? 'start' : 'expand';
        position[positionType](currentGroup.nucleus, args);

        force = args.force || events.force;
        force.sync();

        helpers.syncData(args);

        repositionNodes = helpers.getTransition(
            animation.position.all(args.elements.groups[groupIndex]),
            'repositionNodes'
        );

        repositionNodes.dfd.progress(function(){
            var expandNodes = helpers.getTransition(
                animation.expand(currentGroup.nucleus.index,
                    helpers.extend({
                        isSameNucleus: true,
                        duration: 250
                    },
                    args
                )),
                'expandNodes'
            );

            expandNodes.dfd.progress(function(){
                animation.position.text(args.elements.groups[groupIndex].nodes, args);
            }).done(function(){
                helpers.syncElementsToGroup(groupIndex, args);
                args.elements.groups[groupIndex].nodes.call(helpers.syncNodeDataToCurrentPosition);
            });

        });

        return concept;
    }

    function removeFromGroup(d, i, args) {
        var groupIndex   = helpers.isNum(args.groupIndex) ? args.groupIndex : args.dataset.groups.length - 1,
            positionType = args.position || 'start';

        if(helpers.isPopupOpen()){
            popup.hide.call(this, d, i, args)
                .done(beginRemoval);
        } else {
            beginRemoval();
        }

        function beginRemoval(){
            dataManager.remove(d);
            position.collapseNode(d);
            position[positionType](d, args);

            var force = args.force || events.force;
            force.sync();

            helpers.syncData(args);

            var collapseNodes = helpers.getTransition(
                animation.revert(d, i, helpers.extend(
                    {
                        sameNucleus: true,
                        softReset: true
                    },
                    args,
                    { cb: Function.prototype } // We need to rebind events after all animations are completed: Set as noop
                )).transitions,
                'collapseNodes'
            );

            collapseNodes.dfd.done(function(){
                var repositionNodes = helpers.getTransition(
                    animation.position.all(args.elements.groups[groupIndex]),
                    'repositionNodes'
                );

                repositionNodes.dfd.progress(function(){
                    animation.position.text(args.elements.groups[groupIndex].nodes, args);
                }).done(function(){
                    helpers.syncElementsToGroup(groupIndex, args);
                    args.elements.groups[groupIndex].nodes.call(helpers.syncNodeDataToCurrentPosition);

                    // Rebind events
                    if(args.events){
                        args.events.bind();
                    }
                });
            });
        }


    }

    return {
        addToGroup: addToGroup,
        removeFromGroup: removeFromGroup
    };
});