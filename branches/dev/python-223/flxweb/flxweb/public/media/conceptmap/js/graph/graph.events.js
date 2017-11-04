define([
    'exports',
    'conceptmap/graph/graph.events.behavior',
    'conceptmap/graph/graph.events.handlers',
    'conceptmap/graph/graph.events.bind'
], function(exports, behaviors, handlers, eventsBind){

    // TODO: Reorganize - force.drag should be readily available for binding
    // Set on.drag to force.drag behavior
    eventsBind.on.drag = behaviors.force.drag;

    // Bindings
    exports.on = eventsBind.on;
    exports.off = eventsBind.off;

    exports.bind = eventsBind.bindEvents;
    exports.unbind = eventsBind.unbindEvents;

    exports.binder = eventsBind.binder;
    exports.unbinder = eventsBind.unbinder;

    exports.bindConfig = eventsBind.bindConfig;

    // Handlers
    exports.click = handlers.click;
    exports.mouseenter = handlers.mouseenter;
    exports.mouseleave = handlers.mouseleave;

    exports.forceEvents = behaviors.forceEvents;

    // Behaviors
    exports.force = behaviors.force;
    exports.zoom = behaviors.zoom;
    exports.popupDrag = behaviors.popupDrag;
    // -- Helpers
    exports.resetZoom = behaviors.resetZoom;
    exports.resizeSVG = behaviors.resizeSVG;
});