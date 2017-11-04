define([
    'd3',
    'conceptmap/graph/graph.events',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.animation',
    'conceptmap/graph/graph.force.factory',
    'conceptmap/graph/graph.element.manager',
    'conceptmap/graph/popup/graph.popup',
    'conceptmap/editor/editor.elements',
    'conceptmap/editor/editor.session.manager'
], function(d3, events, config, helpers, animation, ForceFactory, elementManager, popup, editorElements, editorSessionManager){
    'use strict';

    var evts = {
        events: {
            on:  {
                mouseenter: null,
                mouseleave: null,
                mouse: null,
                popup: null,
                popupClick: Function.prototype, // Noop function
                removeClick: null
            },
            off: {
                mouseenter: null,
                mouseleave: null,
                mouse: null,
                popup: null,
                removeClick: null
            },
            bind:   bindEditorEvents,
            unbind: unbindEditorEvents
        }
    };

///////////
// Force //
///////////

    var editorForce = ForceFactory.create(),
        editorData  = helpers.getData('editor');

    var forceData = helpers.extend(
        {
            force: editorForce,
            isDragging: false,
            dragTarget: null
        },
        evts,
        editorData
    );

    editorForce.instanceData = forceData;

    editorForce
        .on('tick', function(){
            requestAnimationFrame(function(){
                events.forceEvents.tick(forceData);
                addButtonForce.tick();
            });
        });

    editorForce.drag()
        .on('dragstart', function(d){
            addButtonForce.setFixedState(function(d){
                d.fixed = helpers.isNucleus(d);
            }).resume();

            events.forceEvents.dragStart.call(this, d, null, forceData);
        })
        .on('drag', function(d){
            addButtonForce.resume(); // Calling tick here will eventually timeout
            events.forceEvents.drag.call(this, d, null, forceData);
        })
        .on('dragend', function(d){
            addButtonForce
                .cooldown()
                .setFixedState(true);

            events.forceEvents.dragEnd.call(this, d, null, forceData);
            editorElements.nodes.call(helpers.syncNodeDataToCurrentPosition);
        });


    ///////////////
    // AddButton //
    ///////////////


    var addButtonForce = ForceFactory.create({
            linkDistance: config.nodes.linkLength * 2
        }),
        addButtonData  = helpers.getData('editorAddButton');

    var addButtonForceData = helpers.extend(
        {
            force: addButtonForce,
            isDragging: false,
            dragTarget: null,
            startTime: null,
        },
        evts,
        addButtonData
    );

    addButtonForce.instanceData = addButtonForceData;

    addButtonForce
        .on('tick', function tick() {
            addButtonData.elements.links
                .attr('x1', function(d) {
                    return d.source.x;
                })
                .attr('y1', function(d) {
                    return d.source.y;
                })
                .attr('x2', function(d) {
                    return d.target.x;
                })
                .attr('y2', function(d) {
                    return d.target.y;
                });

            addButtonData.elements.nodes
                .attr('transform', function(d) {
                    var transform = helpers.getTransform(this);
                    transform.translate = [d.x, d.y];
                    return transform.toString();
                });
        });

    addButtonForce.drag()
        .on('dragstart', function(d){
            dragStart.call(this, d, null, addButtonForceData);
        })
        .on('drag', function(d){
            d3.select(this).call(animation.position.text);
            drag.call(this, d, null, addButtonForceData);
        })
        .on('dragend', function(d){
            dragEnd.call(this, d, null, addButtonForceData);
        });

    function dragStart(d, i, args) {
        var node  = d3.select(this),
            group = helpers.getSelectedGroup(d, args);

        if (helpers.isPopupOpen() || helpers.isAnimating()) { return; }
        d3.event.sourceEvent.stopPropagation();

        args.startTime = Date.now();

        if (helpers.isNucleus(d)) {
            args.force.setFixedState(function(_d) {
                if (group.nodes.indexOf(_d) > -1 && helpers.isNode(_d)){
                    _d.fixed = false;
                }
            });
        }

        d.fixed = true;
        args.dragTarget = node;
        if(!helpers.isMicrosoftBrowser){
            args.dragTarget.moveToFront(); // Move target to front to avoid mouseover effects on other nodes
        }
    }

    function drag(d, i, args){
        if(!args.dragTarget){ return; }
        var transform = helpers.getTransform(args.dragTarget);

        args.isDragging = true;

        d.x = d.px = transform.translate[0] += d3.event.dx;
        d.y = d.py = transform.translate[1] += d3.event.dy;

        args.dragTarget.attr('transform', transform.toString());
    }

    function dragEnd(d, i, args){
        args.force.cooldown();

        var elapsedTime = (Date.now() - args.startTime);

        if(!args.isDragging || elapsedTime <= 50){ // Less than 50ms have elapsed; trigger click
            addClick();
        }

        if(!args.dragTarget){ return; }
        // Update nodes to current transform to avoid 'jumping'
        // on next drag and set to fixed
        if (helpers.isNucleus(d)) {
            args.elements.nodes.call(helpers.syncNodeDataToCurrentPosition);
        } else {
            args.dragTarget.call(helpers.syncNodeDataToCurrentPosition);
        }

        args.dragTarget = args.isDragging = null;
    }

///////////
// Popup //
///////////

    var popupConfig = helpers.clone(events.bindConfig.popup),
        popupOn     = events.binder(popupConfig, popupEditor);

    evts.events.on.popup = popupOn;

    function popupEditor(d, i){
        return popup.handler.call(this, d, i, evts);
    }



///////////
// Mouse //
///////////

    var mouseenterConfig = helpers.clone(events.bindConfig.mouse.enter),
        mouseleaveConfig = helpers.clone(events.bindConfig.mouse.leave);

    var mouseEnterOff = events.unbinder(mouseenterConfig),
        mouseLeaveOff = events.unbinder(mouseleaveConfig);

    var mouseEnterOn = events.binder(mouseenterConfig, mouseentereditor),
        mouseLeaveOn = events.binder(mouseleaveConfig, mouseleaveeditor);

    evts.events.on.mouseenter  = mouseEnterOn;
    evts.events.on.mouseleave  = mouseLeaveOn;
    evts.events.off.mouseenter = mouseEnterOff;
    evts.events.off.mouseleave = mouseLeaveOff;

    evts.events.on.mouse  = function mouseeditorOn(nodes){
        mouseEnterOn.call(null, nodes);
        return mouseLeaveOn.call(null, nodes);
    };
    evts.events.off.mouse = function mouseeditorOff(nodes){
        mouseEnterOff.call(null, nodes);
        return mouseLeaveOff.call(null, nodes);
    };

    function mouseentereditor(d) {
        mouseenterConfig.fn.call(this, d, helpers.extend(
            { editor: true },
            evts,
            editorData
        ));
    }

    function mouseleaveeditor() {
        mouseleaveConfig.fn.call(this, null, evts);
    }

////////////
// Remove //
////////////

    var removeEvents = {
        touchEvent: 'tap',
        event: 'mouseup'
    };

    var removeClickOn  = events.binder(removeEvents, removeClick),
        removeClickOff = events.unbinder(removeEvents);

    evts.events.on.removeClick  = removeClickOn;
    evts.events.off.removeClick = removeClickOff;

    function removeClick(d, i){
        // Remove events from element
        d3.select(this)
            .call(unbindEditorEvents);

        elementManager.removeFromGroup.call(this, d, i, helpers.extend(
            {coords: helpers.getCurrentNucleus(d) },
            editorData,
            evts
        ));

        editorSessionManager.remove(d);
    }

/////////
// Add //
/////////

    function addClick(){
        if(editorElements.search.classed('hide')){
            editorElements.search.call(animation.effects.fadeInCompletely);
        }
    }

/////////////////
// Search Drag //
/////////////////

    var searchDrag = d3.behavior.drag()
        .origin(function(d){
            return d;
        })
        .on('dragstart', calculatePopupDimensions)
        .on('drag', searchDragMove);


    function calculatePopupDimensions(d) {
        // Since the tooltip can change dimensions
        // recalculate the width and height when beginning drag
        var cRect = this.getBoundingClientRect();

        d.width = cRect.width;
        d.height = cRect.height;
    }

    function searchDragMove(d){
        d.x = Math.max(0, Math.min(config.width - d.width, d3.event.x));
        d.y = Math.max(0, Math.min(config.height - d.height, d3.event.y));

        editorElements.search
            .attr('style', 'transform: translate(' + d.x + 'px,' + d.y + 'px);');
    }

    (function createPopup(){
        editorElements.search
            .data(function(){
                return [{
                    x: null,
                    y: null,
                    width: null,
                    height: null
                }];
            })
            .call(searchDrag);

        editorElements.search
            .call(helpers.fakeDisplay)
            .style('transform', function(_d){
                var cRect = this.getBoundingClientRect();
                _d.height = cRect.height;
                _d.width  = cRect.width;
                _d.x = config.width / 2 - (_d.width / 2);
                _d.y = config.height / 2 - (_d.height / 2);

                return 'translate(' + _d.x + 'px, ' + _d.y + 'px)';
            })
            .classed('hide', true)
            .style('display', null);
    })();


/////////////
// Binding //
/////////////

    function bindEditorEvents() {
        var nodes = editorElements.nodes;

        var details      = nodes.selectAll('.detail'),
            popupNodes   = nodes.selectAll('.popup'),
            textMain     = nodes.selectAll('text.main'),
            removeButton = nodes.selectAll('g.removeButton');

        nodes.call(editorForce.drag);

        if(helpers.isTouchDevice){
            details
                .call(mouseEnterOn)
                .call(mouseLeaveOn);
        } else {
            nodes
                .call(mouseEnterOn)
                .call(mouseLeaveOn);
        }

        popupNodes.call(popupOn);
        textMain.call(popupOn);

        removeButton.call(removeClickOn);
    }

    function unbindEditorEvents(){
        editorElements.nodes.call(events.unbind, function(){

            editorElements.nodes
                .selectAll('g.removeButton')
                    .call(removeClickOff);

        });
    }


    return {
        force: editorForce,
        addButtonForce: addButtonForce,
        bind: bindEditorEvents,
        event: evts.events
    };
});
