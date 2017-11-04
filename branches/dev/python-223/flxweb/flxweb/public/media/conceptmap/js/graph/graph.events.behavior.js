 /* globals d3:false */

define([
    'exports',
    'd3',
    'jquery',
    'conceptmap/graph/graph.events.bind',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/popup/graph.popup',
    'conceptmap/graph/graph.animation',
    'conceptmap/graph/graph.logger',
    'conceptmap/graph/graph.zeroState',
    'conceptmap/graph/graph.force.factory',
    'conceptmap/editor/editor.elements'
], function(exports, d3, $, eventsBind, config, data, helpers, elements, popup, animation, logger, zeroState, ForceFactory, editorElements){
    'use strict';


/*=============================
=            FORCE            =
=============================*/

    var svgContainer = d3.select(elements.$svgContainer[0]);

    var force = ForceFactory.create();

    var forceData = helpers.extend(
        {
            force: force,
            isDragging: false,
            dragTarget: null,
            dragGroup:  null,
            dragEls:    null
        },
        helpers.getData()
    );

    force.on('tick', step);

    function step(){
        requestAnimationFrame(function(){
            tick(forceData);
        });
    }

    function tick(args) {
        args.elements.links
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

        args.elements.nodes
            .filter(function(d){
                return args.dragTarget ? args.dragTarget.datum() !== d : true; // Allows nodes to be properly scaled when zoomed out and dragging
            })
            .attr('transform', function(d) {
                var transform = helpers.getTransform(this);
                transform.translate = [d.x, d.y];
                return transform.toString();
            });
    }

    function pauseEvent(){ // Taken from: http://stackoverflow.com/questions/5429827/how-can-i-prevent-text-element-selection-with-cursor-drag
        var e = d3.event.sourceEvent;
        if(e.stopPropagation) { e.stopPropagation(); }
        if(e.preventDefault) { e.preventDefault(); }
        e.cancelBubble = true;
        e.returnValue = false;
        return false;
    }

    force.drag()
        .on('dragstart', function(d){
            dragStart.call(this, d, null, forceData);
        })
        .on('drag', function(d){
            drag.call(this, d, null, forceData);
        })
        .on('dragend', function(d){
            dragEnd.call(this, d, null, forceData);
        });

    function dragStart(d, i, args) {
        var node  = d3.select(this),
            group = helpers.getSelectedGroup(d, args),
            evts  = (args && args.events) || eventsBind;

        if(helpers.isSafari){ pauseEvent(); }

        if(helpers.isTouchDevice){
            node.selectAll('.detail')
                .call(evts.off.mouse);
            // Dispatch a touchstart event on the svg container
            // which will not otherwise fire when we 'tap' anywhere on a node
            var evt = new Event('touchstart');
            svgContainer.node().dispatchEvent(evt);
        } else {
            node.call(evts.off.mouse);
        }

        if (helpers.isPopupOpen() || helpers.isAnimating()) { return; }
        d3.event.sourceEvent.stopPropagation();

        if (helpers.isNucleus(d)) {
            args.force.setFixedState(function(_d) {
                if (group.nodes.indexOf(_d) > -1 && helpers.isNode(_d)){
                    _d.fixed = false;
                }
            });
        }

        d.fixed = true;

        args.dragTarget = node;
        args.dragGroup  = group;
        args.dragEls    = args.elements.nodes.filter(function(_d){
            return args.dragGroup.nucleus === _d || args.dragGroup.nodes.indexOf(_d) > -1;
        });

        args.dragEls.filter(function(_d){ return _d !== d; })
            .style('pointer-events', 'none');

        if(!helpers.isMicrosoftBrowser){
            args.dragTarget.moveToFront(); // Move target to front to avoid mouseover effects on other nodes
        }
    }

    function drag(d, i, args){
        if(!args.dragTarget){ return; }
        if(helpers.isSafari){ pauseEvent(); }

        var transform = helpers.getTransform(args.dragTarget);

        args.isDragging = true;

        d.x = d.px = transform.translate[0] += d3.event.dx;
        d.y = d.py = transform.translate[1] += d3.event.dy;

        if(helpers.isNucleus(d)){
            args.dragEls.call(animation.position.text);
        } else {
            // i.e. a single node being dragged
            args.dragTarget.call(animation.position.text, d);
        }

        args.dragTarget.attr('transform', transform.toString());
    }

    function dragEnd(d, i, args){
        var evts = (args && args.events) || eventsBind;

        args.force.cooldown();

        if(args.dragEls){
            args.dragEls.filter(function(_d){
                    return _d !== d && helpers.isActive(_d);
                })
                .style('pointer-events', 'all');
        }

        if(!args.dragTarget){ return; }

        // Update nodes to current transform to avoid 'jumping'
        // on next drag and set to fixed
        if (helpers.isNucleus(d)) {
            args.dragEls
                .each(updateNodeDataToCurrentPosition)
                .call(helpers.syncGroupDimensions);
        } else {
            args.dragTarget
                .each(updateNodeDataToCurrentPosition)
                .call(helpers.syncGroupDimensions);
        }

        if(helpers.isTouchDevice){
            args.dragTarget.selectAll('.detail')
                .call(evts.on.mouse);
        } else {
            args.dragTarget.call(evts.on.mouse);
        }

        args.dragTarget = args.dragGroup = args.dragEls = args.isDragging = null;
    }

    function resetForce(){
        force.size([config.width, config.height]);
    }

    function updateNodeDataToCurrentPosition(d){
        var transform = helpers.getTransform(this);
        d.x = d.px = transform.translate[0];
        d.y = d.py = transform.translate[1];
        d.fixed = true;
    }

/*============================
=           POPUP            =
============================*/

    var popupDrag = d3.behavior.drag()
        .origin(function(d){
            return d;
        })
        .on('dragstart', calculatePopupDimensions)
        .on('drag', popupDragMove);


    function calculatePopupDimensions(d) {
        // Since the tooltip can change dimensions
        // recalculate the width and height when beginning drag
        var cRect = this.getBoundingClientRect();

        d.width = cRect.width;
        d.height = cRect.height;
    }

    function popupDragMove(d){
        d.x = Math.max(0, Math.min(config.width - d.width, d3.event.x));
        d.y = Math.max(0, Math.min(config.height - d.height, d3.event.y));

        elements.popup
            .attr('style', 'transform: translate(' + d.x + 'px,' + d.y + 'px);');
    }


/*============================
=            ZOOM            =
============================*/
    var zoomIn  = document.getElementById('zoom-in'),
        zoomOut = document.getElementById('zoom-out'),
        aerial  = document.getElementById('aerial');

    var zoomLimits = config.zoomLimits,
        maxZoomOut = zoomLimits[0],
        maxZoomIn  = zoomLimits[1];

    var zoom = d3.behavior.zoom()
        .scaleExtent(zoomLimits)
        .on('zoom', zoomHandler);

    function _changeZoomUIState(){
        // Give max zoom out a 1 percent buffer
        if(data.zoomScale <= (maxZoomOut + (maxZoomOut * 0.01))){
            zoomOut.setAttribute('disabled', 'disabled');
            aerial.setAttribute('disabled', 'disabled');
            zoomIn.removeAttribute('disabled');

        // Give max zoom in a 1 percent buffer
        } else if (data.zoomScale >= (maxZoomIn - (maxZoomIn * 0.01))){
            zoomIn.setAttribute('disabled', 'disabled');
            aerial.removeAttribute('disabled');
            zoomOut.removeAttribute('disabled');

        } else {
            zoomIn.removeAttribute('disabled');
            zoomOut.removeAttribute('disabled');
            aerial.removeAttribute('disabled');
        }
    }

    var changeZoomUIState = helpers.debounce(_changeZoomUIState, 100);

    function zoomHandler() {
        var scale, translate, transform;

        if(helpers.isAnimating()){ return; }
        var els = helpers.isEditorState() ? editorElements : elements;

        scale          = d3.event.scale;
        translate      = d3.event.translate;
        transform      = 'translate(' + translate.join(',') + ')scale(' + scale + ')';
        data.zoomScale = scale;

        els.container
            .attr('transform', transform);

        changeZoomUIState();
    }


    // Taken from http://bl.ocks.org/mbostock/7ec977c95910dd026812
    function setZoom(currentScale, zoomLevel, duration){
        duration = duration >= 0 ? duration : 750;
        var center0, center1, currentTranslate, newScale, coords;

        currentScale = currentScale || zoom.scale();
        newScale     = zoomLevel || currentScale * Math.pow(2, +this.getAttribute('data-zoom'));

        // We don't want the zoom to go out of bounds
        if (newScale < maxZoomOut){
            // Set to zoom out limit
            newScale = maxZoomOut;
            duration *= 0.75;
        } else if (newScale > maxZoomIn) {
            // Set to zoom in limit
            newScale = maxZoomIn;
            duration *= 0.75;
        }

        var els = helpers.isEditorState() ? editorElements : elements;

        els.container.call(zoom.event); // https://github.com/mbostock/d3/issues/2387

        // Record the coordinates (in data space) of the center (in screen space).
        center0 = [config.width / 2, config.height / 2];
        currentTranslate = zoom.translate();
        coords = coordinates(center0, currentTranslate, currentScale);

        // Set the new scaling
        zoom.scale(newScale);

        // Translate back to the center.
        center1 = point(coords, currentTranslate, newScale);

        zoom.translate([
            currentTranslate[0] + center0[0] - center1[0],
            currentTranslate[1] + center0[1] - center1[1]
        ]);
        els.container.transition().duration(duration).call(zoom.event);
    }

    function coordinates(_point, _translate, _scale) {
        return [
            (_point[0] - _translate[0]) / _scale,
            (_point[1] - _translate[1]) / _scale
        ];
    }

    function point(_coordinates, _translate, _scale) {
        return [
            _coordinates[0] * _scale + _translate[0],
            _coordinates[1] * _scale + _translate[1]
        ];
    }

    function resetZoom(translate, scale, duration){
        var els = helpers.isEditorState() ? editorElements : elements;

        translate = translate || [0, 0];
        scale     = scale || maxZoomIn;
        duration  = duration || 0;
        zoom.scale(scale);
        zoom.translate(translate);
        data.zoomScale = scale;
        els.container.call(zoom.event);
        els.container.transition().duration(duration).call(zoom.event);
        changeZoomUIState();
    }

    // Bind to the zoom in and out buttons
    d3.selectAll('button[data-zoom].conceptmap__ui-button')
        .on('click', function () {
            setZoom.call(this, null, null);
            logger.mainScreen('button', this.id);
        });

    d3.select('button#aerial')
        .on('click', function(){
            setZoom.call(this, zoom.scale(), maxZoomOut);
            logger.mainScreen('button', 'aerial');
        });

/*=============================
=            MOUSE            =
=============================*/

    var groupContainers = {
        allElements: true,
        editorElements: true
    };

    // Used with mouseenter effects
    d3.selection.prototype.moveToFront = function() {
        return this.each(function() {
            var isParentGroup = this.parentNode.nodeName === 'g' && groupContainers[this.parentNode.id],
                parent        = isParentGroup ? this.parentNode : this.parentNode.parentNode,
                child         = isParentGroup ? this : this.parentNode;

            parent.appendChild(child);
        });
    };

/*=============================
=           RESIZE            =
=============================*/

    var resizeSVG = function resizeSVG(){
        helpers.recalcSizes();
        helpers.updateTextSize();
        helpers.setViewBox();
        resetForce();

        if(helpers.isZeroState()) {
            zeroState.positionNodes();
        }
    };

/*=============================
=           TOUCH             =
=============================*/

    // Modified from http://bl.ocks.org/jczaplew/7018691

    var DURATION   = 500,
        LONG_PRESS = DURATION * 2,
        start      = 0,
        last       = 0,
        singleTapTimer,
        lastTarget;

    function onTapStart() {
        d3.event.preventDefault();
        start = d3.event.timeStamp;
    }

    function onTapEnd() {
        d3.event.preventDefault();

        var timeStamp = d3.event.timeStamp,
            target = d3.event.target,
            evt, startTouchDuration, lastTouchDuration;

        if(forceData.isDragging){ return; }

        startTouchDuration = timeStamp - start;
        lastTouchDuration  = timeStamp - last;

        if(singleTapTimer){ clearTimeout(singleTapTimer); }

        // Double taps should only be triggered on the same target
        if (lastTouchDuration < DURATION && lastTarget === target) {
            evt = new CustomEvent('dbltap', {
                bubbles: true
            });
            target.dispatchEvent(evt);
            return;
        }

        if(startTouchDuration <= LONG_PRESS){ // If longpress - do nothing
            singleTapTimer = setTimeout(function(){
                evt = new CustomEvent('tap', {
                    bubbles: true
                });
                target.dispatchEvent(evt);
            }, DURATION);
        }

        last       = d3.event.timeStamp;
        lastTarget = target;
    }


    if(helpers.isTouchDevice){
        svgContainer
            .on('mousedown', onTapStart)
            .on('touchstart', onTapStart)
            .on('mouseup', onTapEnd)
            .on('touchend', onTapEnd);
    }



/////////////
// Exports //
/////////////

    // Behaviors
    exports.force = force;
    exports.zoom = zoom;
    exports.popupDrag = popupDrag;

    // Event Handlers
    exports.forceEvents = {
        dragStart: dragStart,
        drag: drag,
        dragEnd: dragEnd,
        tick: tick
    };

    // Helpers
    exports.resetZoom = resetZoom;
    exports.resizeSVG = resizeSVG;
});
