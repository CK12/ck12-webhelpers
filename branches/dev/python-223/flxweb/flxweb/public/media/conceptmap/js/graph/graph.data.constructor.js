define([
    'exports',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.data.manager',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.notification',
    'conceptmap/filter'
], function(exports, config, data, dataManager, elements, helpers, notification, filter){
    'use strict';


////////////////////////
// Construct/Collapse //
////////////////////////

    function constructGraph(d, args) {
        var graphData     = helpers.getData(args.dataType),
            isSameNucleus = typeof args.isSameNucleus === 'boolean' ? args.isSameNucleus : d === args.currentNucleus,
            isFirstNucleus = args.firstNucleus || args.positionType === 'start';

        var conceptNucleus = args.currentNucleus && !isFirstNucleus ? currentConcept(d) : dataManager.createNucleus(d, args),
            group          = isSameNucleus && graphData.dataset.groups.length ? helpers.getCurrentGroup(graphData) : dataManager.createGroup(conceptNucleus),
            connections    = getConnections(conceptNucleus);

        notification.clear();

        // We don't want to push in a duplicate of the same nucleus
        // But add nuclei if list is empty
        if(!isSameNucleus || !graphData.dataset.nuclei.length){
            graphData.dataset.nuclei.push(conceptNucleus);
        }

        if (isFirstNucleus) { // i.e. the first nucleus for the graph
            graphData.dataset.graph.nodes.push(conceptNucleus);
            connections.forEach(function(connection, i){
                dataManager.add(connection, helpers.extend({
                    cardinality: i,
                    groupIndex: 0,
                    group: group,
                    source: 0,
                    target: i + 1,
                    dataType: args.dataType
                },
                graphData
            ));
            });
        } else {
            connections.slice(0, config.nodes.maxNodes).forEach(function(connection, i){
                dataManager.add(connection, helpers.extend({
                    group: group,
                    groupIndex: graphData.dataset.groups.length - 1,
                    cardinality: i,
                    nucleus: conceptNucleus,
                    dataType: args.dataType
                },
                graphData
        ));
            });
        }

        if(!helpers.getRelated(conceptNucleus).length){
            createNoConnectionsNotification(true);
        } else if (connections.length === 0) {
            createNoConnectionsNotification();
        }
    }

    function collapseGraph(d, isSoftReset) {
        var group = isSoftReset ? helpers.getCurrentGroup() : data.groups.pop();

        group.nodes.forEach(function(){
            data.graph.links.pop();
            data.graph.nodes.pop();
        });

        if(isSoftReset){
            // Reset current group nodes/links
            group.nodes = [];
            group.links = [];
        } else {
            // Destroy rest of references
            delete group.nuclei;
            data.nuclei.pop();
        }

        // Always remove elements group as we resync afterwards
        elements.groups.pop();
    }

    function currentConcept(concept){
        concept.group = concept.parentGroup + 1;
        return concept;
    }

/////////////////
// Connections //
/////////////////

    function getConnections(concept) {
        var _related, related, eids;

        data.filter = filter.currentValue();
        if(!data.connectionStrength) { data.connectionStrength = {}; }

        related = helpers.getRelated(concept);

        if(data.filter === 'All'){
            related = sortAllByRelevancy(related);
        } else {
            _related = getSortedTypeData(related, data.filter);
            eids     = _related.topRelated.map(function(item){ return item.EID; });
            related  = _related.topRelated.concat(
                _related.prereqs.filter(function(item){ return !hasEID(eids, item); })
            );
        }

        return related
            .slice(0, (config.nodes.maxNodes + config.nodes.maxPrereq))
            .filter(function(rel){
                return data.subjects[rel.EID]; // Filter out connections missing from dataset
            })
            .map(function(rel){
                var connection = data.subjects[rel.EID];
                if(rel.p){ connection.prereq = true; }
                return connection;
            });
    }

    function sortByScore(a, b){
        return (b.score || 0) - (a.score || 0); // Prereqs sometimes do not have a score, default to 0
    }

    function hasEID(eids, item){
        return eids.indexOf(item.EID) > -1;
    }

    function isType(item, type){
        var eid = helpers.isEID(item) ? item : item.EID;
        return helpers.getBranch(eid) === type;
    }

    function getSortedTypeData(related, type){
        return {
            prereqs: related.filter(function(item){
                return item.p && isType(item, type);
            }),

            topRelated: related.filter(function(item){
                return isType(item, type); // This will include the prereqs
            }).sort(sortByScore).slice(0, config.nodes.maxNodes)
        };
    }

    function sortAllByRelevancy(related) {
        var math           = getSortedTypeData(related, 'Math'),
            science        = getSortedTypeData(related, 'Science'),
            sliceRemainder = config.nodes.maxNodes,
            largestRelated, smallestRelated, eids;


        if(science.topRelated.length + math.topRelated.length <= config.nodes.maxNodes){
            related = math.topRelated.concat(science.topRelated);
        } else {
            largestRelated  = science.topRelated.length > math.topRelated.length ? science.topRelated : math.topRelated;
            smallestRelated = science.topRelated.length > math.topRelated.length ? math.topRelated : science.topRelated;
            smallestRelated = smallestRelated.slice(0, Math.min(smallestRelated.length, config.nodes.maxNodes / 2));
            sliceRemainder -= smallestRelated.length;
            largestRelated  = largestRelated.slice(0, sliceRemainder);

            related = smallestRelated.concat(largestRelated);
        }

        eids    = related.map(function(item){ return item.EID; });
        related = related
            .concat(
                math.prereqs.filter(function(item){ return !hasEID(eids, item); }),
                science.prereqs.filter(function(item){ return !hasEID(eids, item); })
            )
            .sort(sortByScore);

        return related;
    }

//////////////////
// Notification //
//////////////////

    function createNoConnectionsNotification(noRelatedConcepts){
        var currentFilter         = filter.currentValue(),
            currentFilterOpposite = currentFilter === 'Math' ? 'Science' : 'Math',
            bodyTextLine1, bodyTextLine2;

        bodyTextLine1 = noRelatedConcepts ? 'This concept has no connections'       : 'This concept has no connections in ' + currentFilter;
        bodyTextLine2 = noRelatedConcepts ? 'Try searching for a different concept' : 'Try viewing connections in ' + currentFilterOpposite;

        var baseNotification = {
            header:   '<img src="/media/conceptmap/images/icon-telescope.svg">',
            body:     '<p>' + bodyTextLine1 + '.</p>'
        };

        if(noRelatedConcepts){
            notification.create($.extend(baseNotification, {
                body:  baseNotification.body + '<p>' + bodyTextLine2 + '.</p>',
                duration: Infinity
            }));
        } else {
            notification.action($.extend(baseNotification, {
                element:  '<a href="#">' + bodyTextLine2 + '.</a>',
                callback: filter.changeSubject
            }));

        }
    }

    exports.construct = constructGraph;
    exports.collapse  = collapseGraph;

    exports.sortAllByRelevancy = sortAllByRelevancy;
});
