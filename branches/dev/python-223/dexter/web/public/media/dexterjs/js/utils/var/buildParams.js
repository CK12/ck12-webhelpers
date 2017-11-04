define(["utils/var/isArray"], function(isArray) {
    return function buildParams( prefix, obj, add ) {
        var name;
        var rbracket = /\[\]$/;
        var buff = "";

        if ( isArray( obj ) ) {
            // DEPRECATED, instead of serializing the array elements the way jQuery does it, 
            // we will stringify each element and comma seperate the elements. Finally, we 
            // wrap the stringified elements with brackets and pass it as an argument to buildParams
            /* 
            // Serialize array item.
            obj.forEach(function(v, i) {
                if ( rbracket.test( prefix ) ) {
                    // Treat each array item as a scalar.
                    add( prefix, v );
                } else {
                    // Item is non-scalar (array or object), encode its numeric index.
                    buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, add );
                }
            });
            */
            obj.forEach(function(el, idx, self) {
                buff += JSON.stringify(el);
                if (idx !== self.length-1) {
                    buff += ",";
                }
            });
            buildParams( prefix, "[" + buff + "]", add );

        } else if ( typeof obj === "object" ) {
            // Serialize object item.
            for ( name in obj ) {
                buildParams( prefix + "[" + name + "]", obj[ name ], add );
            }

        } else {
            // Serialize scalar item.
            add( prefix, obj );
        }
    };
});
