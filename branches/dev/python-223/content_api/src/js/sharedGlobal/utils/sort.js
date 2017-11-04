'use strict';

function sortArrayBasedOnAnothersOrder(arr, defaultsArr){
    var nonMatches = [],
        matches = [];

    arr.forEach(function (arrItem) {
        if( defaultsArr.indexOf(arrItem) > -1 ) {
            matches.push(arrItem);
        } else {
            nonMatches.push(arrItem);
        }
    });

    matches.sort(function(a, b){
        a = defaultsArr.indexOf(a);
        b = defaultsArr.indexOf(b);
        if (a > b) {
            return 1;
        }
        if (a < b) {
            return -1;
        }
        return 0;
    });

    return matches.concat(nonMatches);
}

module.exports = {
    byOrder: sortArrayBasedOnAnothersOrder
};