define([
    'jquery',
    'forums/tests/testData',
    'sinon'
], function($, Data){

    var server = sinon.fakeServer.create();
    var set = false;
    server.autoRespond = true;
    server.xhr.useFilters = true;
    server.xhr.addFilter(function(method, url){
        // console.log(url);
        var pass = !url.match(/\/flx\/forums\/all(.*)$/) && 
                   !url.match(/\/flx\/group\/add\/member/)&&
                   !url.match(/\/flx\/group\/delete\/member/)&&
                   !url.match(/\/flx\/group\/members/)&&
                   !url.match(/\/flx\/create\/group/)&&
                   !url.match(/\/auth\/get\/info\/my/)&&
                   !url.match(/\/flx\/delete\/group(.*)$/)&&
                   !url.match(/\/flx\/get\/member\/notifications/)&&
                   !url.match(/\/flx\/update\/group/)&&
                   !url.match(/\/flx\/set\/member\/notifications/)&&
                   !url.match(/\/peerhelp\/api\/get\/latest\/post(.*)$/)&&
                   !url.match(/\/flx\/get\/appdata\/flxweb-up-forums/) &&
                   !url.match(/\/flx\/save\/appdata\/flxweb-up-forums/);
        return pass;
    });
    // Get Forums
    server.respondWith("GET", /\/flx\/forums\/all(.*)$/,
        [200, { "Content-Type": "application/json" },JSON.stringify(Data.forums)]);
    // Follow
    server.respondWith("POST", '/flx/group/add/member', function(xhr){
        xhr.respond(200, {'Content-Type': 'application/json'}, JSON.stringify(Data.status0));
    });
    // Unfollow
    server.respondWith("POST", '/flx/group/delete/member', function(xhr){
        xhr.respond(200, {'Content-Type': 'application/json'}, JSON.stringify(Data.status0));
    });
    // Get Members
    server.respondWith("GET", /\/flx\/group\/members(.*)$/, function(xhr){
        xhr.respond(200, {'Content-Type': 'application/json'}, JSON.stringify(Data.members));
    });

    //Create a forum
    server.respondWith("POST", '/flx/create/group', function(xhr){
        xhr.respond(200, {'Content-Type': 'application/json'}, JSON.stringify(Data.forum));
    });

    //Delete a forum
    server.respondWith("GET", /\/flx\/delete\/group(.*)$/, function(xhr){
        xhr.respond(200, {'Content-Type': 'application/json'}, JSON.stringify(Data.deleteForum));
    });    

    //Check if the user is authenticated
    server.respondWith("GET", /\/auth\/get\/info\/my/, function(xhr){
        xhr.respond(200, {'Content-Type': 'application/json'}, JSON.stringify(Data.user));
    });

    //Get notification for forum setting
    server.respondWith("GET", /\/flx\/get\/member\/notifications/, function(xhr){
        xhr.respond(200, {'Content-Type': 'application/json'}, JSON.stringify(Data.notifications));
    });

    //Update notification
    server.respondWith("POST", /\/flx\/set\/member\/notifications/, function(xhr){
        xhr.respond(200, {'Content-Type': 'application/json'}, JSON.stringify(Data.status0));
    });

    //Update a forum
    server.respondWith("POST", /\/flx\/update\/group/, function(xhr){
        var postData = deparam(xhr.requestBody);
        Data.forum.response.group.name = postData.newGroupName;
        Data.forum.response.group.description = postData.newGroupDesc;

        xhr.respond(200, {'Content-Type': 'application/json'}, JSON.stringify(Data.forum));
    });
    //Get Latest comment
    server.respondWith("GET", /\/peerhelp\/api\/get\/latest\/post(.*)$/, function(xhr){
        xhr.respond(200, {'Content-Type': 'application/json'}, JSON.stringify(Data.peerHelpLatestComment));
    });

    //Tutorial
    server.respondWith("GET", /\/flx\/get\/appdata\/flxweb-up-forums/, function(xhr){
        console.log('get tutorial');
        var responseData = Data.tutorialGetAppData;
        if(set){
            responseData.response.userdata.tutorialShown = true;
        }
        xhr.respond(200, {'Content-Type': 'application/json'}, JSON.stringify(responseData));
    });
    server.respondWith("PUT", /\/flx\/save\/appdata\/flxweb-up-forums/, function(xhr){
        console.log('set tutorial');
        var postData = deparam(xhr.requestBody);
        console.log('post data:::', postData);
        set = true;
        xhr.respond(200, {'Content-Type': 'application/json'}, JSON.stringify(Data.tutorialGetAppData));
    });
    function deparam
    ( params, coerce ) {
        var obj = {},
        coerce_types = {
            'true': !0,
            'false': !1,
            'null': null
        };

        // Iterate over all name=value pairs.
        $.each(params.replace(/\+/g, ' ').split('&'), function(j, v) {
            var param = v.split('='),
                decode = decodeURIComponent,
                key = decode(param[0]),
                val,
                cur = obj,
                i = 0,

                // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
                // into its component parts.
                keys = key.split(']['),
                keys_last = keys.length - 1;

            // If the first keys part contains [ and the last ends with ], then []
            // are correctly balanced.
            if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
                // Remove the trailing ] from the last keys part.
                keys[keys_last] = keys[keys_last].replace(/\]$/, '');

                // Split first keys part into two parts on the [ and add them back onto
                // the beginning of the keys array.
                keys = keys.shift().split('[').concat(keys);

                keys_last = keys.length - 1;
            } else {
                // Basic 'foo' style key.
                keys_last = 0;
            }

            // Are we dealing with a name=value pair, or just a name?
            if (param.length === 2) {
                val = decode(param[1]);

                // Coerce values.
                if (coerce) {
                    val = val && !isNaN(val) ? +val // number
                        : val === 'undefined' ? undefined // undefined
                        : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
                        : val; // string
                }

                if (keys_last) {
                    // Complex key, build deep object structure based on a few rules:
                    // * The 'cur' pointer starts at the object top-level.
                    // * [] = array push (n is set to array length), [n] = array if n is 
                    //   numeric, otherwise object.
                    // * If at the last keys part, set the value.
                    // * For each keys part, if the current level is undefined create an
                    //   object or array based on the type of the next keys part.
                    // * Move the 'cur' pointer to the next level.
                    // * Rinse & repeat.
                    for (; i <= keys_last; i++) {
                        key = keys[i] === '' ? cur.length : keys[i];
                        cur = cur[key] = i < keys_last ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : []) : val;
                    }

                } else {
                    // Simple key, even simpler rules, since only scalars and shallow
                    // arrays are allowed.

                    if ($.isArray(obj[key])) {
                        // val is already an array, so push on the next value.
                        obj[key].push(val);

                    } else if (obj[key] !== undefined) {
                        // val isn't an array, but since a second value has been specified,
                        // convert val into an array.
                        obj[key] = [obj[key], val];

                    } else {
                        // val is a scalar.
                        obj[key] = val;
                    }
                }

            } else if (key) {
                // No value was defined, so set something meaningful.
                obj[key] = coerce ? undefined : '';
            }
        });

        return obj;
    };
});
