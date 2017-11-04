
define([
    'jquery',
    'ck12annotator/config',
    'ck12annotator/helpers',
    'ck12annotator/plugins.loaded',
    'common/utils/url',
    'annotator'
], function($, config, helpers, pluginsLoaded, URLHelper) {
    'use strict';

    function CK12Annotator(target, artifactID, revisionID, isLogin, colors) {
        this.target = target;
        this.artifactID = artifactID;
        this.revisionID = revisionID;
        this.isLogin = isLogin;
        this.colors = colors || config.colors;
        this.annotationsPromise = $.Deferred();
    };
    CK12Annotator.prototype.create = function(){
        init(this.target, this.artifactID, this.revisionID, this.colors, this.isLogin , this.annotationsPromise);
    };
    CK12Annotator.prototype.destroy = function(){
        if($(this.target).data('annotator')){
            $(this.target).data('annotator').destroy();
        }
    }
    function init(target, artifactID, revisionID, colors, isLoggedIn, annotationsPromise){
        var url = new URLHelper();
        var searchURL = 'flx/search/annotations';

        if(url.search_params.email || url.search_params.memberID){
            if(url.search_params.memberID){
                searchURL = 'flx/migrated/annotations?memberID='+url.search_params.memberID;
            }else if(url.search_params.email){
                searchURL = 'flx/migrated/annotations?email='+url.search_params.email;
            }
        }
        var timeTilTimeout   = 10000,
            intervalDuration = 1000,
            maxIntervals     = timeTilTimeout / intervalDuration,
            intervalCount    = 0,
            initInterval;

        if (target) {
            var $target = $(target),
                annoInstance;

            var CK12Config = {
                colors: colors,
                isLoggedIn: isLoggedIn
            }
            if ($target.length) {
                annoInstance = $target.annotator()
                    .annotator('addPlugin', 'Store', {
                        prefix: '/',
                        annotationData: {
                            artifactID: artifactID,
                            version: config.version,
                            revisionID: revisionID
                        },
                        loadFromSearch: {
                            artifactID: artifactID,
                            version: config.version
                        },
                        urls: {
                            // These are the default URLs.
                            'create': 'wr/flx/annotations',
                            'update': 'wr/flx/annotations/:id',
                            'destroy': 'wr/flx/annotations/:id',
                            'search': searchURL
                        }
                    })
                    .annotator('addPlugin', 'CK12Annotation', CK12Config);

                if( helpers.isTouchDevice() ){
                    config.isLoggedIn = isLoggedIn;
                    annoInstance.annotator('addPlugin', 'Touch', config);
                }
                $target.data('annotator').plugins.CK12Annotation.getAnnotations().done(function(data){
                    annotationsPromise.resolve(data);
                });
            }
        }
    }
    return CK12Annotator;
});
