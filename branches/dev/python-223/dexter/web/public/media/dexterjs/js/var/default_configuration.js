define(function(){
    return {
        // TODO: configurable callbacks for onload, onunload, and logEvent

        // mixins are automatically added to the payload parameter of the request body
        mixins: {
            timestamp: null,
            hash: null,
            pageViewData: null,
            resWidth : screen.width,
            resHeight : screen.height,
            device : (window.device) ? window.device.name : '',
            url_referrer : document.referrer,
            page_url: (window.location)?(window.location.href): ''
        },
        // clientID is a mixin, but it is not included in the 'payload' parameter of the request body
        clientID: null,


        // NON-MIXIN CONFIG
        // These details are used for both cookie as well as localStorage
        // NOTE: cookies' 'expire' was deprecated and replaced by
        // max-age, which specifies the seconds before a cookie is nom-nom'd.
        clientStorage: {
            session: {
                name        : 'dexterjsSessionID',
                value       : null,
                domain      : '.ck12.org',
                path        : '/',
                'max-age'   : (60 * 30 ), // units are in seconds
                secure      : false
            },
            visitor: {
                name        : 'dexterjsVisitorID',
                value       : null,
                domain      : '.ck12.org',
                path        : '/',
                'max-age'   : (180 * 24 * 60 * 60 ), // units are in seconds !!!
                secure      : false
            }
        },

        events: {
            timeSpent: 'FBS_TIMESPENT'
        },


        apis: {
            recordEvent: (document.location.protocol+'//'+document.location.host+'/dexter/record/event'),
            recordEventBulk: (document.location.protocol+'//'+document.location.host+'/dexter/record/event/bulk'),
            recordEventBulkZip: (document.location.protocol+'//'+document.location.host+'/dexter/record/event/bulk/zip')
        },

        requireUserSignIn: true,

        noQueue: false,

        trackPageTime: true,

        trackScreenResolution: true,

        trackReferrer : true,

        // DEXTER QUEUE CONFIG
        dexterQueueName: 'dexter',

        // automatically call ajax after each queue push
        dexterQueueAutoFlush: false,

        //Declarative instrumentation plugin
        declarativePlugin: {
            'enabled': true,               // enabled by default
            'defaultDomEvent': 'click',     // by default look for click events only
            'additionalDomEvents': '',      // all other types of dom event. For these element attribute domEvent needs to match
            'selector': '.dxtrack, .dxtrack-user-action',         // selector of the elements to instrument
            'dataPrefix': 'data-dx-'        // prefix for data attributes that include the payload
        },

        //Optimizely plugin
        optimizelyPlugin: {
            'enabled': true              // enabled by default
        }

    };
});
