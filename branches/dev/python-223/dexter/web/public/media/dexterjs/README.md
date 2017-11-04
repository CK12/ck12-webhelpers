About
-----

Dexterjs is a library that encapsulates all of the ADS events.
When dexterjs loads on a page, it immediately looks for an array (queue) called
`dexter`.  If no `dexter` object is on the page, then dexterjs creates one for you.
The `dexter` queue allows you to push events to the queue, update event payloads, and transmit all events in the queue.

Since dexterjs is a factory function, you need to invoke and/or configure it before you can start logging. Otherwise, you can
use the queue to log events.



Usage
-----

### Initial Setup

`dexterjs` should ideally be the *last* thing that you load on the page:

    <script src="//dvninqhj78q4x.cloudfront.net/dexterjs/dexterjs.min.js"></script>

NOTE: if you are using an AMD loader (like requirejs), then you should use the AMD loader to load dexterjs:

    require(["//dvninqhj78q4x.cloudfront.net/dexterjs/dexterjs.min.js"]);

You need to set the initial configuration like this:

    dexterjs.set("config", { clientID: 12345 });

Or, set the "config" key by passing an object literal; the internal config will be extended with your object.

    dexterjs.set("config", {
        memberID: 123,
        clientID: 321,
        trackPageTime: false
    });


### Log an Event

Log an event using the dexterjs factory.

    dexterjs.logEvent("eventName", {
        parameter: "some value for my eventName payload"
    }, callback);


NOTE: The `callback` is OPTIONAL and may be a function to be executed upon success of the XHR, or
it may be an object containing `success` and `error` functions.
Use of callbacks is discouraged in normal app flow because events should be triggered
without needing to depend on the XHR response.

Log a single event (via dexterjs' queue).

    dexter.logEvent("eventName", {
        parameter: "some value for my eventName payload"
    });

Push events to the queue.

    dexter.push(
        {
            eventName: "myEvent1",
            payload: {
                data1: "some interesting data"
            }
        }, {
            eventName: "myEvent2",
            payload: {
                datum: "more interesting data"
            }
        }
    );

Log all events that are in the queue; this empties the queue.

    dexter.flush();

### Bulk Upload of Events

You can pass an array of events to upload simultaneously

    dexterjs.logEvent([
        { eventType: "page-view"    , payload: { views  : 32 } } ,
        { eventType: "mouse-click"  , payload: { clicks : 17 } } ,
        { eventType: "touch-taps"   , payload: { taps   : 99 } }
    ]);

### The `Mixins` Object

The `mixins` object is an object that *extends* the `payload` of each call to `logEvent`. For example,
during app setup, you may want to declare a parameter, say `appID`, that will always be sent. You don't need
to keep declaring a property called `appID` in your logEvent payloads; instead, just set the `mixins` object.

    // Extend the config.mixins object
    dexterjs.set("config:mixins", {
        "appID" : "MY_GREAT_APP"
    });

    // Alternatively, you could extend the config
    dexterjs.set("config", {
        "mixins": {
            "appID" : "MY_GREAT_APP"
        }
    });

Now, each call to `logEvent` will automatically 'mixin' the appID into each payload.


#### pageViewData: dynamic data evaluation
`Dexterjs` provides support for dynamically evaluating a function that will return an object.
Ideally this can be used to track the change in a page over a session. To utilize this functionality,
you must define the `pageViewData` property in the `mixins` object of `config`. The benifit of using
`pageViewData` is that the payload is *extended* by the result of the `pageViewData` function.

    // Set the pageViewData property in mixins
    dexterjs.set("config:mixins", {
        "pageViewData" : function() {
            return {
                "userState" : "idle"
            }
        }
    });
    // OR, use a function pointer so you have more control.
    dexterjs.set("config:mixins", { "pageViewData" : myPageViewDataFunction } );


Advanced Usage
--------------

If you want more customization over the logging object and do not need the queue methods, then
you can use the `dexterjs` factory to create a customized logger.

Use the dexterjs factory to configure your own object:

    var dexter = dexterjs({
        clientID: 12345,
        appID: "my-app",
        clientContext: {
            session: {
                cookie: "dexterSessionCookie",
                expire: 60*60 // seconds
            }
        },
        dexterjsAPIServer: "http://non-default-server.com/",
        trackPageTime: false
    });

Log an event with your user-configured dexter object.

    dexter.logEvent("eventName", {
        parameter: "some value for my eventName payload"
    });


Configuration
-------------
See the [default_configuration](/dexterjs/js/var/default_configuration.js) for a complete list of factory options.


Developing
-----
cd <dexterjs root dir>/
sudo npm install
sudo npm run dev

The steps above, will start a local development server on port 80. You can test use following URLs to test:
http://localhost/tests/index.html
http://localhost/examples/declarative.html

To watch and rebuild dexterjs use:
grunt watch

BUILD
-----

Prereqs:
* node
* mr-doc ( install using npm install -g mr-doc)

To build the library:

    cd <dexterjs root dir>/
    npm install
    grunt

    or grunt production

To compile the docs:

    grunt exec:docs

Remember to check in the generated dexterjs.js and dexterjs.min.js after adding any functionality.


TESTS
-----

You should write a unit test in the tests/index.html file if you plan on adding functionality.

Versioning
----------
The version number is located in the package.json file and should be updated manually.
The version is set as a property on the `dexterjs` object during the build process.


TODOs
-----
* Add functionality for updating event payloads for events in the dexter queue.
* zip payloads (maybe... it's expensive, and should be done in a worker thread)
* Convert current test cases to chai tests.
