define(function() {
    return function deepLookup(prop, sourceObj) {
        var propPaths = (prop)?(''+prop).split('.'):[],
            currObj = sourceObj,
            prop;
        if (typeof currObj === 'undefined'){ return undefined; }
        for (var i = 0, l = propPaths.length; i < l; i++) {
            prop = propPaths[i];
            if ( (typeof currObj) === 'object' && !(currObj instanceof Array) ){
                if ( propPaths[i] in currObj ){
                    currObj = currObj[prop];
                } else {
                    return undefined;
                }
            } else {
                try {
                    if ( (currObj instanceof Array) && !Number.isNaN(Number.parseInt(prop)) ){
                        prop = Number.parseInt(prop);
                    }
                    currObj = currObj[prop];
                    if (typeof currObj === 'undefined'){
                        return undefined;
                    }
                } catch(e) {
                    console.log(e);
                    return undefined;
                }
            }

        }
        return currObj;
    };
});
