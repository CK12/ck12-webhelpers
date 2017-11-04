/* globals d3:false */
define([
    'exports',
    'd3',
    'conceptmap/graph/graph.events.handlers',
    'conceptmap/graph/popup/graph.popup',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/graph.helpers'
], function(exports, d3, handler, popup, elements, helpers){

    /*=============================
    =            BIND             =
    =============================*/

    function binder(args, cb) {

        return function(nodes, _cb){

            // Allow seperate callback to be used
            // in case initial callback not available
            if(typeof _cb === 'function'){ cb = _cb; }

            if(helpers.isTouchDevice && args.touchEvent){
                // Set parent emitter
                if(args.parentTouchEvent){
                    if(typeof args.emitter !== 'function' && args.emitter !== null){ throw 'Emitter must be either a function or null'; }
                    nodes.on(args.parentTouchEvent, args.emitter);
                }
                nodes.on(args.touchEvent, cb);

            } else {
                nodes.on(args.event, cb);
            }

            if(args._unbindAll){
                // Needed in some instances where some event bindings automatically bind
                // a touch event instance as well i.e. force
                nodes.on(args.event, null);
                nodes.on(args.touchEvent, null);
            }

            return nodes;
        };
    }

    function unbinder(args){
        var _args = $.extend({}, args);

        if(_args.parentTouchEvent){
            _args.emitter = null;
        }

        if(_args.unbindAll){
            // Privatize unbindAll to prevent binding events from accidently using
            _args._unbindAll = true;
        }

        return binder(_args, null);
    }

/////////////
// Emitter //
/////////////

    var lastActiveTarget = null;

    function mouseTouchEmitter(){
        var target = d3.event.target,
            inactiveEvent,
            evt;

        if(helpers.isHighlightedNode(target)){
            evt = new CustomEvent('dbltap'); // Explore or revert
        } else {
            evt = new CustomEvent('activeNode');
        }
        target.dispatchEvent(evt);
        if(lastActiveTarget && lastActiveTarget !== target){
            inactiveEvent = new CustomEvent('inactiveNode');
            lastActiveTarget.dispatchEvent(inactiveEvent);
        }
        lastActiveTarget = target;
    }

////////////
// Events //
////////////

    var dragEvents = {
            touchEvent: 'touchstart.drag',
            event: 'mousedown.drag',
            unbindAll: true
        },
        forceEvents = {
            event: '.force'
        },
        zoomEvents = {
            event: '.zoom'
        },
        popupEvents = {
            touchEvent: 'tap',
            event: 'click'
        };

    var mouseEvents = {
        enter: {
            parentTouchEvent: 'tap',
            emitter: mouseTouchEmitter,
            touchEvent: 'activeNode',
            event: 'mouseenter',
            fn: handler.mouseenter
        },
        leave: {
            parentTouchEvent: 'tap',
            emitter: mouseTouchEmitter,
            touchEvent: 'inactiveNode',
            event: 'mouseleave',
            fn: handler.mouseleave
        }
    };

    var clickEvents = {
        click: {
            touchEvent: 'dbltap',
            event: 'mouseup',
            // event: 'click',
            fn: handler.click
        },
        clickTrending: {
            touchEvent: 'tap',
            event: 'click',
            fn: handler.clickTrending
        }
    };


// On
    var clickHandlerOn         = binder(clickEvents.click, clickEvents.click.fn),
        clickTrendingHandlerOn = binder(clickEvents.clickTrending, clickEvents.clickTrending.fn),
        mouseEnterOn           = binder(mouseEvents.enter, mouseEvents.enter.fn),
        mouseLeaveOn           = binder(mouseEvents.leave, mouseEvents.leave.fn),
        popupOn                = binder(popupEvents, popup.handler),
        popupClickOn           = binder(popupEvents, popup.hideThenClick);

// Off
    var clickHandlerOff         = unbinder(clickEvents.click),
        clickTrendingHandlerOff = unbinder(clickEvents.clickTrending),
        mouseEnterOff           = unbinder(mouseEvents.enter),
        mouseLeaveOff           = unbinder(mouseEvents.leave),
        popupOff                = unbinder(popupEvents),
        popupClickOff           = unbinder(popupEvents),
        dragOff                 = unbinder(dragEvents),
        forceOff                = unbinder(forceEvents),
        zoomOff                 = unbinder(zoomEvents);

// Mouse shortcut
    function mouseUnbind(nodes){
        mouseEnterOff.call(null, nodes);
        return mouseLeaveOff.call(null, nodes);
    }

    function mouseBind(nodes){
        mouseEnterOn.call(null, nodes);
        return mouseLeaveOn.call(null, nodes);
    }


    var on = {
            click: clickHandlerOn,
            clickTrending: clickTrendingHandlerOn,

            mouseenter: mouseEnterOn,
            mouseleave: mouseLeaveOn,
            mouse: mouseBind,

            popup: popupOn,
            popupClick: popupClickOn,

            drag: null // Updated later to use behaviors.force.drag,
        },
        off = {
            click: clickHandlerOff,
            clickTrending: clickTrendingHandlerOff,

            mouseenter: mouseEnterOff,
            mouseleave: mouseLeaveOff,
            mouse: mouseUnbind,

            popup: popupOff,
            popupClick: popupClickOff,

            drag: dragOff,
            force: forceOff,
            zoom: zoomOff
        };



    /////////////
    // Binding //
    /////////////
    function bindEvents(nodes, cb){
        var _nodes = nodes instanceof Array ? nodes : elements.nodes;

        var details    = _nodes.selectAll('.detail'),
            popupNodes = _nodes.selectAll('.popup'),
            textMain   = _nodes.selectAll('text.main');



        if(helpers.isTouchDevice){
            _nodes.call(on.drag);
            details.call(on.mouse);
        } else {
            _nodes.call(on.mouse);
        }

        details.call(on.click);

        popupNodes.call(on.popup);
        textMain.call(on.popup);

        if(typeof cb === 'function'){ cb(_nodes); }
    }

    function unbindEvents(nodes, cb){
        nodes = nodes instanceof Array ? nodes : elements.nodes;

        var details    = nodes.selectAll('.detail'),
            popupNodes = nodes.selectAll('.popup'),
            textMain   = nodes.selectAll('text.main');

        nodes
            .call(off.drag)
            .call(off.force);

        if(helpers.isTouchDevice){
            details.call(off.mouse);
        } else {
            nodes.call(off.mouse);
        }

        details.call(off.click);

        popupNodes.call(off.popup);
        textMain.call(off.popup);

        if(typeof cb === 'function'){ cb(); }
    }


    exports.bindEvents = bindEvents;
    exports.unbindEvents = unbindEvents;

    exports.binder = binder;
    exports.unbinder = unbinder;

    exports.on = on;
    exports.off = off;
    exports.bindConfig = {
        mouse: mouseEvents,
        popup: popupEvents
    };
});
