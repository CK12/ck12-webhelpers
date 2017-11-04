define([
    'conceptmap/graph/graph.helpers'
], function(helpers){

    function isModified(eid){
        var char = getFirstChar(eid);
        return isRemoved(char) || isAdded(char);
    }

    function isAdded(eid){
        var char = getFirstChar(eid);
        return char === '+';
    }

    function isRemoved(eid){
        var char = getFirstChar(eid);
        return char === '-';
    }

    function getFirstChar(str){
        return !helpers.isEID(str) ? str.charAt(0) : str;
    }

    function getUnmodifiedEid(eid){
        return isModified(eid) ? eid.slice(1) : eid;
    }

    return {
        isModified: isModified,
        isAdded: isAdded,
        isRemoved: isRemoved,
        getUnmodifiedEid: getUnmodifiedEid
    };
});