define([
    'conceptmap/graph/graph.helpers',
    'conceptmap/editor/editor.session.manager'
], function(helpers, editorSessionManager){

    var STORE_ID = 'conceptMapEditorStore';

    function validateGroup(fn){
        return function(group){
            if(typeof group !== 'object' || !group.nucleus || !helpers.isEID(group.nucleus.EID)){
                return console.error('Invalid group');
            }
            return fn.apply(this, arguments);
        }
    }

    function getStateTypeOperator(d){
        d = typeof d === 'string' ? d : d.stateType;

        if(d === 'removed'){
            return '-';
        } else if (d === 'added'){
            return '+';
        } else {
            return '';
        }
    }

    function getStore(){
        return JSON.parse(
            localStorage.getItem(STORE_ID) || '{}'
        );
    }

    function get(args){
        var store = getStore();
        return store[args.encodedID];
    }

    function add(group, args){
        args = args || {};

        var store   = getStore(),
            session = editorSessionManager.get();

        var addedEids = session.current.added.map(function(d){
                return d.EID;
            }),
            removedEids = session.current.removed.map(function(d){
                return d.EID;
            });

        // Find previously added nodes that were removed
        // As their reference will not be stored anywhere, we can only find it by
        // finding the difference
        var removedAddedNodes = session.startSnapshot.eids
            .filter(function(eid){
                return session.currentSnapshot.eids.indexOf(eid) === -1 &&
                       removedEids.indexOf(eid) === -1 &&
                       addedEids.indexOf(eid) === -1;
            })
            .map(function(eid){
                return getStateTypeOperator('removed') + eid;
            });


        // Get eids of current added and removed with proper operator
        var nodes = group.nodes
            .filter(function(d){
                // Not a nucleus and does not share an added EID
                return helpers.isNode(d) && addedEids.indexOf(d.EID) === -1;
            })
            .concat(session.current.removed)
            .concat(session.current.added)
            .map(function(d){
                return getStateTypeOperator(d) + d.EID;
            });

        store[group.nucleus.EID] = nodes;
        localStorage.setItem(STORE_ID, JSON.stringify(store));

        if(!args.persist){
            editorSessionManager.clear();
        }

        return nodes.map(function(eid){
            // This adds in the '+' operator for previously removed nodes that have been undone
            return addedEids.indexOf(eid) > -1 ? '+' + eid : eid;
        })
        // Add in previously added eids that were removed this session
        // We do not want these removed added nodes in the store
        // They should only be sent to the service for updates
        .concat(removedAddedNodes);
    }

    function remove(group){
        var store = getStore();

        if(!store[group.nucleus.EID]){ return false; }

        delete store[group.nucleus.EID];
        localStorage.setItem(STORE_ID, JSON.stringify(store));

        return store;
    }

    return {
        get: get,
        add: validateGroup(add),
        remove: validateGroup(remove)
    };

});