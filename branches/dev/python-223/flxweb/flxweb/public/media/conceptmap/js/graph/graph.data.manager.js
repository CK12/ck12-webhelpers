define([
    'jquery',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.data'
], function($, helpers, data){

/////////
// Add //
/////////

    function add(eid, args){
        var dataset = args.dataset;

        var concept = helpers.isEID(eid) ? data.subjects[eid] : eid,
            group   = args.group || dataset.groups[args.groupIndex],
            link;

        var cardinality = helpers.isNum(args.cardinality) ? args.cardinality : group.nodes.length;

        concept = createClone(concept, {
            group: args.groupIndex,
            cardinality: cardinality,
            dataset: args.dataset,
            elements: args.elements,
            editor: args.editor || args.dataType === 'editor'
        });

        dataset.connectionStrength[concept.EID] = (concept.score || 0);

        group.nodes.push(concept);
        dataset.graph.nodes.push(concept);

        var linkSource = typeof args.source === 'number' ? args.source : dataset.graph.nodes.indexOf(args.nucleus),
            linkTarget = typeof args.target === 'number' ? args.target : dataset.graph.nodes.length - 1;

        link = {
            source: linkSource,
            target: linkTarget
        };

        // Since the link object is shared, when force.links(dataset.links) is eventually used
        // It will update the source and target indexes to be their represented dataset
        group.links.push(link);
        dataset.graph.links.push(link);

        return concept;
    }

    function remove(d){
        var dataset   = d.dataset,
            nodeIndex = d.index,
            linkIndex = nodeIndex - 1;

        // Remove from graph nodes and group
        dataset.graph.nodes.splice(nodeIndex, 1);
        dataset.groups[d.group].nodes.splice(nodeIndex - 1, 1);

        // Update index on remaining elements
        dataset.graph.nodes.slice(nodeIndex)
            .forEach(function(node){
                node.index -= 1;
            });

        // Remove from graph links and group
        dataset.graph.links.splice(linkIndex, 1);
        dataset.groups[d.group].links.splice(linkIndex, 1);
    }

////////////
// Create //
////////////

    function createGroup(concept){
        var group = {
            nucleus: concept,
            nodes: [],
            links: []
        };

        concept.dataset.groups.push(group);

        return group;
    }

    function createNucleus(concept, args){
        var graphData = helpers.getData(args.dataType);

        return createClone(concept, helpers.extend(
            {
                group: graphData.dataset.groups.length,
                fixed: false
            },
            graphData
        ));
    }


//////////
// Misc //
//////////

    function createClone(connection, args) {
        if(typeof args.group !== 'number'){
            throw Error('Need group index when creating clone');
        }

        var clone = helpers.clone(
            connection,
            { related: helpers.getRelated(connection) },
            { modalities: helpers.getModalities(connection) },
            { parentGroup: args.group }, // Marker of original starting group
            args
        );

        setNodeData(clone, args);

        return clone;
    }

    function setNodeData(clone, args){
        var strength   = args.dataset.connectionStrength[clone.EID],
            sizeIndex  = helpers.getSizeIndex(strength),
            colorIndex = helpers.getColorIndex(strength);

        clone.nodeSizeIndex = sizeIndex;
        clone.nodeColorIndex = colorIndex;
        clone.createdAt = Date.now();
        helpers.radius(clone);

        return clone;
    }


    return {
        add: add,
        remove: remove,

        createNucleus: createNucleus,
        createGroup: createGroup
    };
});