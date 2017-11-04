define(["utils/var/buildParams"], function(buildParams) {
    // Serialize an array of form elements or a set of
    // key/values into a query string
    return function serialize ( a ) {
        var r20 = /%20/g,
            prefix,
            s = [],
            add = function( key, value ) {
                /* jshint ignore:start */
                // If value is a function, invoke it and return its value
                value = (typeof value === "function") ? value() : ( value == null ? "" : value );
                s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
                //  double url encode a single quote; dexter backend throws errors on sending 
                //  single quotes and %27, so we encodeURLComponent the "%27" to obtain "%2527"
                s[ s.length - 1 ] = s[ s.length - 1 ].replace(/'/g, "%2527");
                /* jshint ignore:end */
            };

            // encode params recursively.
            for ( prefix in a ) {
                buildParams( prefix, a[ prefix ], add );
            }

        // Return the resulting serialization
        return s.join( "&" ).replace( r20, "+" );
    };
});
