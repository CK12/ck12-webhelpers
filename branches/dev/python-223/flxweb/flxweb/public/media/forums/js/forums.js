define([
    'jquery',
    'backbone1x',
    'marionette',
    'forums/models/models',
    'forums/forums.app',
    'softRegistration/RegEvents',
    'softRegistration/SoftRegConfig'
],
function($, Backbone, Mn, Models, App,  RegEvents, SoftRegConfig){
    'use strict';
    var app = new App();

    var router =  new Mn.AppRouter({
        appRoutes: {
            'forums(/)': 'list',
            'forum/:forum_id(/)': 'mobileNav',
            'forum/:forum_id/home(/)(?*querystring)': 'home',
            'forum/:forum_id/member(/)': 'member',
            'forum/:forum_id/setting(/)': 'setting',
            'forum/:forum_id/question/:post_id(/)': 'questionDetailsView'
        },
        controller: app
    });
    function navigateWrapper(f){
        return function(path, obj){
            var fragment = /^\//.test(path)? path.substring(1): path;
            var route = Backbone.history.handlers.filter(function(handler){
                return handler.route.test(fragment);
            })[0].route;
            var params = router._extractParameters(route, fragment);
            if(fragment !== Backbone.history.getFragment()){  //Avoid to trigger RegEvents twice. Backbone.history.on('route', func) will trigger RegEvents if home/member/setting page is the landing page.
                RegEvents.trigger(SoftRegConfig.EventType.PAGE_ROUTE_CHANGE,route, params);
            }
            f.call(Backbone.history, path, obj);
        };
    }
    Backbone.history.navigate = navigateWrapper(Backbone.history.navigate);
    // Added for raising an event whenever this route changes
    // If in future, there is a need do more than soft registration, RegEvents need to be abstracted out
    Backbone.history.on('route', function(route, params){
        RegEvents.trigger(SoftRegConfig.EventType.PAGE_ROUTE_CHANGE,route, params);
    });
    app
    .on('start', function() {
        Backbone.history.start({
            pushState: true
        });
    });

    app.start();
});
