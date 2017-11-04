define([
    'underscore',
    'backbone1x',
    'marionette',
    'schools/schools.app',
    'softRegistration/RegEvents',
    'softRegistration/SoftRegConfig'
],
function(_, Backbone, Mn, App, RegEvents, SoftRegConfig){
    'use strict';
    var app = new App();
    var router = new Mn.AppRouter({
        appRoutes: {
            'schools(/)': 'home',
            'schools/:state(/)': 'state',
            'schools/:state/:school-:id(/)': 'school', //TODO : Check if this route is indeed needed.
            'schools/:state/:school': 'school' 
        },
        controller: app
    });

    // Added for raising an event whenever this route changes
    // If in future, there is a need do more than soft registration, RegEvents need to be abstracted out 
    router.on('route', function(route, params){
        if( route != 'home'){
            RegEvents.trigger(SoftRegConfig.EventType.PAGE_ROUTE_CHANGE, route, params)
        }
    })

    app
    .on('start', function() {
        Backbone.history.start({
            pushState: true
        });
    })
    .on('stateNavigation', function(state, autoSelect){
        var url = 'schools/' + state;
        router.navigate(url, {trigger: true, replace : !!(autoSelect) });
    })
    .on('schoolNavigation', function(state, school, id){
        var url = _.template("schools/<%-state%>/<%-school%>", {
            state:state,
            school:school,
            id:id
        });
        router.navigate(url, {trigger: true});
    });
    app.start();
    return router;
});
