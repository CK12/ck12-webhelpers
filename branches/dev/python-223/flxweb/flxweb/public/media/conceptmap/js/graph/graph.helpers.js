/* globals d3:false */
define([
    'd3',
    'jquery',
    'underscore',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/graph.shortnames',

    'conceptmap/editor/editor.data',
    'conceptmap/editor/editor.elements'
], function(d3, $, _, config, data, elements, shortnames, editorData, editorElements){
    'use strict';

//////////
// Node //
//////////

    function getIndex(strength){
        /* eslint yoda: 0 */
        return 0;

        // Uncomment below for relevancy node sizing

        // if (strength >= 0.0 && 0.2 > strength) { return 0; }
        // if (strength >= 0.2 && 0.4 > strength) { return 1; }
        // if (strength >= 0.4 && 0.6 > strength) { return 2; }
        // if (strength >= 0.6 && 0.8 > strength) { return 3; }
        //
        // return 4;
    }

    function getTransform(node){
        if(!(node instanceof Array)){ node = d3.select(node); }
        return d3.transform(node.attr('transform'));
    }

    ///////////////
    // Node Data //
    ///////////////

    function getBranch(eid) {
        return eid.split('.')[0] === 'SCI' ? 'Science' : 'Math';
    }

    function getSubject(eid) {
        return shortnames[eid.split('.')[1]].name;
    }

    function dataGetter(d, type){
        var _data;

        if(!d){ return []; }

        if(isEID(d)){
            _data = data[type][d];
        } else {
            if(!d.hasOwnProperty('EID')){ return []; }
            _data = data[type][d.EID];
        }

        return _data instanceof Array ? _data : [];
    }

    function getModalities(d){
        return dataGetter(d, 'modalities');
    }

    function getRelated(d){
        return dataGetter(d, 'related');
    }

    function getConcept(eid){
        if(!isEID(eid)){ throw Error(eid + ' is not a EID'); }
        return data.subjects[eid];
    }

    function getRelatedByShortname(shortname){
        var re = new RegExp('\\.' + shortname + '\\.'), keys;

        keys = _.filter(_.keys(data.subjects), function(key){
            return re.test(key);
        });

        return _.pick(data.subjects, keys);
    }

    function getShortnameBySubject(subject){
        var shortname = null;
        for (var name in shortnames) {
            if (shortnames.hasOwnProperty(name) && shortnames[name].url === subject) {
                shortname = name;
                break;
            }
        }
        return shortname;
    }

    function getTopLevelParent(eid) {
        var topLevel = shortnames[eid.split('.')[1]].topLevel;
        var i = 0;

        // Takes off the last 3 digits of the EID to determine the parent category
        while (i < topLevel.length && topLevel[i] <= parseInt(eid.substr(8))){
            i++;
        }

        return data.subjects[eid.substr(0, 8) + topLevel[i - 1]];
    }

    function sampleSubjectsWithRelated(list, min){
        min = typeof min === 'number' ? min : 1;

        var sample = [],
            i      = 0,
            related;

        list = _.shuffle(list);

        for (var eid in list) {
            if (list.hasOwnProperty(eid)) {

                related = getRelated(list[eid]);
                if(list[eid] && related && related.length >= min){
                    sample.push(list[eid]);
                    if(++i === config.trending.numNodes){ break; }
                }

            }
        }

        return sample;
    }

    /////////////////
    // Node colors //
    /////////////////

    function getColorIndex(strength){
        return getIndex(strength) + 1;
    }

    function getColor(d) {
        var hues = config.nodes.colors[getBranch(d.EID)],
            hueIndex = d.nodeColorIndex || 0;

        return isNucleus(d) ? hues[0] : hues[hueIndex];
    }

    function lighten(color, n) { //Like lowering opacity, but without showing the links beneath a node
        var background = d3.rgb('rgb(249,249,245)'),
            rgb = d3.rgb(color);
        return 'rgb(' + (n * rgb.r + (1 - n) * background.r) + ',' + (n * rgb.g + (1 - n) * background.g) + ',' + (n * rgb.b + (1 - n) * background.b) + ')';
    }

    function inactiveLighten(d){
        return lighten(getColor(d), 0.2);
    }

    /////////////////////
    // Node dimensions //
    /////////////////////

    function getSizeIndex(strength){
        return getIndex(strength);
    }

    function radius(d, i, args) {
        // Incase items don't have a nodeSizeIndex (i.e. zero state)
        var _radius = d.nodeSizeIndex >= 0 && !isNucleus(d) ? config.nodes.size[d.nodeSizeIndex] : config.nodes.sizeNucleus;
        d.radius = _radius;
        return d.radius;
    }

    /////////////////
    // Node states //
    /////////////////

    function getCurrentGroup(d){
        var dataset = (d && d.dataset) || data;
        return dataset.groups[dataset.groups.length - 1];
    }

    function getCurrentElementsGroup(args) {
        var els = (args && args.elements) || elements;
        return els.groups[els.groups.length - 1];
    }

    function currentGroupContains(d, i, args){
        var currentGroup = getCurrentGroup(args);
        return currentGroup.nucleus === d || currentGroup.nodes.indexOf(d) > -1;
    }

    function getPreviousGroup(){
        return data.groups[data.groups.length - 2] || getCurrentGroup();
    }

    function getNodes(d){
        var group = getCurrentGroup(d);
        return group && group.nodes;
    }

    function isNucleus(d) {
        var dataset = (d && d.dataset) || data;
        return dataset.nuclei.indexOf(d) !== -1;
    }

    function isNode(d){
        return !isNucleus(d);
    }

    function getCurrentNucleus(d) {
        var dataset = (d && d.dataset) || data;
        return dataset.nuclei[dataset.nuclei.length - 1];
    }

    function getCurrentNucleusNode(args) {
        var els = (args && args.elements) || elements;

        var currentEID = getCurrentNucleus(args).EID,
            filtered = els.nodes.filter(function(d){
                return d.EID === currentEID;
            }),
            nodes = filtered[0];

        // If there are multiple nuclei with the same eid, always grab the last
        return nodes[nodes.length - 1];
    }

    function isCurrentNucleus(d){
        return d === getCurrentNucleus(d);
    }

    function isActive(d) {
        var nodes = getNodes(d);
        return (isNucleus(d) || nodes && nodes.indexOf(d) !== -1);
    }

    // Used for determining whether the node is open on touch events
    function isHighlightedNode(target){
        var parent = getParentGroup(target),
            polygon = parent.querySelector('polygon.popup');

        return polygon.style.opacity === '1';
    }

    function getParentGroup(target){
        target = target.node ? target.node() : target;

        if(d3.select(target).classed('node')){ return target; }
        if(d3.select(target.parentNode).classed('node')){ return target.parentNode; }
        if(d3.select(target.parentNode.parentNode).classed('node')){ return target.parentNode.parentNode; }
    }

    function getSelectedGroup(d, args) {
        var isDatum    = !isNum(d),
            groupIndex = !isDatum ? d : getGroup(d),
            dataset    = isDatum ? d.dataset : (args && args.dataset) || data;

        return dataset.groups[groupIndex];
    }

    function getGroup(d) {
        return isNucleus(d) ? d.group : d.parentGroup;
    }

    function isSameGroup(d1){
        return function(d2){
            return getSelectedGroup(d1) === getSelectedGroup(d2);
        };
    }

    function getElementsFromGroup(groupIndex, _data) {
        _data = _data || getData();

        var group = _data.dataset.groups[groupIndex];

        return {
            nucleus: getNucleusFromGroup(null, group, _data),
            nodes: getNodesFromGroup(null, group, _data),
            links: getLinksFromGroup(null, group, _data)
        };
    }

    function getLinksFromGroup(index, group, _data){
        return getTypeFromGroup('links', index, group, _data);
    }

    function getNodesFromGroup(index, group, _data){
        return getTypeFromGroup('nodes', index, group, _data);
    }

    function getNucleusFromGroup(index, group, _data){
        return getTypeFromGroup('nodes', index, group, _data, 'nucleus');
    }

    function getTypeFromGroup(type, index, group, _data, groupType) {
        group = typeof group === 'object' ? group : _data.dataset.groups[index];
        groupType = groupType || type;

        var selectedGroupType = group[groupType],
            filterer = selectedGroupType instanceof Array ? function filterByArray(d){
                return selectedGroupType.indexOf(d) > -1;
            } : function filterByObject(d){
                return selectedGroupType === d;
            };

        return _data.elements[type].filter(filterer);
    }

    ////////////////////
    // Node animation //
    ////////////////////

    function stagger(d) {
        return config.duration + (isNucleus(d) ? 1 : d.cardinality * config.quick);
    }

    function getRelatedCount(d, type) {
        var related = getRelated(d);

        type = type || 'All';

        if(type !== 'All'){
            related = related.filter(function(o){
                return getBranch(o.EID) === type;
            });
        }

        return Math.min((config.nodes.maxNodes + config.nodes.maxPrereq), related.length);
    }

    function getNodeDuration(d, type){
        return config.duration + getRelatedCount(d, type) * config.quick;
    }

    ///////////////
    // Node text //
    ///////////////

    // Modified from http://bl.ocks.org/mbostock/7555321
    function wrap(textNodes, maxWidth, calc, cb) {
        textNodes.each(function(d) {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                tspans = [],
                lineNumber = 0,
                lineHeight = config.lineHeight.concept, // ems
                dy = parseFloat(text.attr('dy') || 0),
                tspan = text.text(null).append('tspan'),
                x, y;

            tspans.push(tspan);
            /* eslint no-cond-assign:0 */
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(' '));
                if (tspan.node().getComputedTextLength() > maxWidth) {
                    line.pop();
                    tspan.text(line.join(' '));
                    line = [word];

                    // Remove tspan if no text
                    if(!tspan.text()){
                        tspan.remove();
                        tspans.splice(tspans.indexOf(tspan), 1);
                    }

                    tspan = text.append('tspan').text(word);
                    tspans.push(tspan);
                }
            }

            y = text.attr('y') || 0;
            x = text.attr('x') || 0;

            d.textRow = tspans.length;
            d.maxTextWidth = maxWidth;

            if(!x && calc.x){ x = textPositionX(d); }
            if(!y && calc.y){ y = textPositionY(d); }


            cb({
                textNode: text,
                tspans: tspans,
                lineNumber: lineNumber,
                lineHeight: lineHeight,
                x: x,
                y: y,
                dy: dy,
                parent: d3.select(this.parentNode)
            });
        });
    }

    function wrapTextDownwards(textNodes, maxWidth, calc){
        maxWidth = Math.min( (maxWidth || winWidth() * 0.15), 175); // Limit of 175 for wider screen sizes
        calc = calc || {x: false, y: false};

        wrap(textNodes, maxWidth, calc, function(_args){

            _args.parent
                .attr('transform', 'translate(' + _args.x + ' ' + _args.y + ')');

            _args.tspans.forEach(function(tspan, index){
                tspan.attr({
                    class: 'conceptText',
                    x: 0,
                    y: 0,
                    dy: index * _args.lineHeight + _args.dy + 'em'
                });
            });
        });
        return this;
    }

    function isCardinalPointX(equ){
        return equ === 0 || equ === Math.PI;
    }

    function isCardinalPointY(equ){
        return equ === Math.PI / 2;
    }

    function getQuadrant(radian){
        var cos = Math.cos(radian),
            sin = Math.sin(radian),
            tan = Math.tan(radian);

        if(cos > 0 && sin > 0 && tan > 0){ return 1; } // Southeast
        if(sin > 0){ return 2; } // Southwest
        if(tan > 0){ return 3; } // Northwest
        if(cos > 0){ return 4; } // Northeast
    }

    function getSign(num){
        if(!Math.sign){
            if(num === 0){ return 0; }
            return num < 0 ? -1 : 1;
        }

        return Math.sign(num);
    }

    function textPositionX(d, i, args) {
        var equ, x, sign, offset;

        d.angle = d.angle || 0;

        if (isNucleus(d)){ return textPositionXNucleus(); }

        equ      = getEquation(d);
        x        = d.radius * Math.cos(d.angle);
        sign     = getSign(x);
        offset   = sign * d.maxTextWidth;

        if (closeToNorthSouthPoles(equ)){
            offset = getSign(offset) === -1 ? -Math.abs(offset / 2) : 0;

        // Right half of the circle
        } else if(equ > Math.PI / 2 && equ < Math.PI){
            offset = 40;

        } else if (equ === Math.PI){ // 360deg
            offset = sign * (d.radius / 2) + 40;

        } else if (equ === 0){ // 180deg
            offset += sign * (d.radius / 2);

        }

        return x + offset;
    }

    function textPositionXNucleus() {
        return -config.nodes.sizeNucleus;
    }

    function textPositionY(d) {
        var rows, textHeight, quadrant, equ, y, sign, offset;
        d.angle = d.angle || 0;

        rows       = d.textRow || 1;
        textHeight = (rows * (config.fontSize * config.lineHeight.concept)) + (config.fontSize * config.lineHeight.subject);

        if (isNucleus(d)){
            return textPositionYNucleus(d);
        }

        quadrant = getQuadrant(d.angle);
        equ      = getEquation(d);
        y        = d.radius * Math.sin(d.angle);
        sign     = getSign(y);
        offset   = sign * (d.radius / 2 + textHeight);

        if(isCardinalPointX(equ)){ offset = 0; }

        // Bottom half of the circle
        if((quadrant === 1 || quadrant === 2) && !isCardinalPointX(equ)){
            offset = sign * (d.radius / 2 + 25);
        }

        if (closeToNorthSouthPoles(equ) ){
            // north pole else south pole
            offset = quadrant === 3 || quadrant === 4 ? offset - 40 : offset + 10;
        }

        return y + offset;
    }

    function textPositionYNucleus(d){
        var rows = d.textRow || 1,
            textHeight = (rows * (config.fontSize * config.lineHeight.concept)) + (config.fontSize * config.lineHeight.subject);

        return -textHeight - d.radius - 10;
    }

    function getEquation(d){
        return (Math.abs(Math.abs(d.angle % (2 * Math.PI)) - Math.PI));
    }

    function isTopHalfOfCircle(d){
        var quadrant = getQuadrant(d.angle);
        return quadrant === 4 || quadrant === 3;
    }

    function updateTextSize() {
        var fontSize = config.fontSize + 'px';

        if(elements.nodes){
            elements.nodes.selectAll('text.main')
                .style('font-size', fontSize);
        }

        if(elements.trendingNodes){
            elements.trendingNodes.selectAll('text.main')
                .style('font-size', fontSize);
        }

        if(editorElements.nodes){
            editorElements.nodes.selectAll('text.main')
                .style('font-size', fontSize);
        }
    }

    function closeToNorthSouthPoles(equ){
        var halfPI = Math.PI / 2,
            percentHalfPI = halfPI * 0.25,
            minHalf = halfPI - percentHalfPI,
            maxHalf = halfPI + percentHalfPI;

        return between(equ, minHalf, maxHalf);
    }

    function between(num, min, max){
        return num >= min && num <= max;
    }

    function getTextPosition(node, d){
        var subject = node.select('.subjectText'),
            subDy   = parseFloat(subject.attr('dy').slice(0, -2));

        return {
            x: textPositionX(d),
            y: textPositionY(d),
            dy: subDy
        };
    }

/////////
// SVG //
/////////

    function calcViewBox(){
        var height = svgHeight(),
            width  = winWidth(),
            newHeight, newWidth,
            x, y, vb;

        x = y = 0;

        // Scale the whole svg down
        newHeight = height * config.svgScale;
        newWidth  = width * config.svgScale;

        // Offset the y to position nucleus in center of screen
        y = -(newHeight - height) / 2;
        x = -(newWidth - width) / 2;

        vb = {x: x, y: y, width: newWidth, height: newHeight, uWidth: width, uHeight: height};
        return vb;
    }

    function setViewBox() {
        var vb = calcViewBox(),
            vbStr =  vb.x + ' ' + vb.y + ' ' + vb.width + ' ' + vb.height;

        elements.$svgContainer.css({
            paddingTop: vb.height
        });

        if(elements.svg){
            // IE11 and now Edge need the width and height to be set otherwise
            // the aspect ratio gets messed up.
            if(isMicrosoftBrowser) {
                elements.svg
                    .attr('height', vb.uHeight)
                    .attr('width', vb.uWidth);
            }

            elements.svg
                .attr('viewBox', vbStr);
            updateBackPlate(vb);
        }

        if(elements.trendingSvg){
            if (isMicrosoftBrowser) {
                elements.trendingSvg
                    .attr('height', vb.uHeight)
                    .attr('width', vb.uWidth);
            }

            elements.trendingSvg
                .attr('viewBox', vbStr);
        }

        if(editorElements.svg){
            if (isMicrosoftBrowser) {
                editorElements.svg
                    .attr('height', vb.uHeight)
                    .attr('width', vb.uWidth);
            }

            editorElements.svg
                .attr('viewBox', vbStr);
        }
    }


    function getViewBox() {
        var viewBox = elements.svg.attr('viewBox');
        viewBox = viewBox.split(' ').map(parseFloat);
        return {
            x: viewBox[0],
            y: viewBox[1],
            width: viewBox[2],
            height: viewBox[3]
        };
    }


    function updateBackPlate(vb){
        elements.svg
            .select('rect')
                .attr('x', vb.x)
                .attr('y', vb.y)
                .attr('width', vb.width)
                .attr('height', vb.height);
    }

    function getCenterCoords(args){
        var svg   = args instanceof Node ? args : args.elements.svg.node(),
            cRect = svg.getClientRects()[0];

        return {
            x: getCenterX(null, cRect),
            y: getCenterY(null, cRect)
        };
    }

    function getCenterX(svg, cRect){
        if(svg){
            cRect = svg.getClientRects()[0];
        }

        return cRect.width / 2;
    }

    function getCenterY(svg, cRect){
        if(svg){
            cRect = svg.getClientRects()[0];
        }

        return cRect.height / 2;
    }


////////////////
// Displaying //
////////////////

    function fakeDisplay(){
        this.style('opacity', 0)
            .style('display', 'block');
    }

    function show(){
        this.style('display', 'block')
            .style('opacity', 1);
    }

    function hide(){
        this.style('opacity', 0)
            .style('display', 'none');

    }

    function showOverlay() {
        elements.$overlay.addClass('show');
    }

    function hideOverlay() {
        elements.$overlay.removeClass('show');
    }

///////////
// State //
///////////

    function isPopupOpen(){
        return elements.popup.style('display') !== 'none';
    }

    function isZeroState(){
        return elements.$contentWrapper.hasClass('zeroState');
    }

    function isEditorState(){
        return elements.$contentWrapper.hasClass('editorState');
    }


//////////
// Data //
//////////

    function syncLinkData(args){
        args.elements.links = args.elements.links.data(
            args.dataset.graph.links, function(d, i){
                return d.source.name + '-' + d.target.name + '-' + d.target.createdAt;
            }
        );
    }

    function syncNodeData(args){
        var firstNode, firstNodeCreatedAt;


        if(args.elements.nodes[0].length === 1){
            firstNode = args.elements.nodes.datum();
            firstNodeCreatedAt = firstNode.createdAt;
        }

        args.elements.nodes = args.elements.nodes.data(
            args.dataset.graph.nodes, function(d, i){
                var createdAt = i === 0 && firstNodeCreatedAt ? firstNodeCreatedAt : d.createdAt;
                return d.name + '-' + createdAt;
            }
        );
    }

    function syncData(args){
        args = args || getData();
        syncNodeData(args);
        syncLinkData(args);
    }

    function syncElementsToGroup(groupIndex, args) {
        var _data   = args || getData(),
            els     = _data.elements,
            dataset = _data.dataset,
            groupLength;

        if(isNum(groupIndex)){
            els.groups[groupIndex] = getElementsFromGroup(groupIndex, _data);
        } else {
            els.groups.push(
                getElementsFromGroup(dataset.groups.length - 1, _data)
            );
        }
    }

    function syncNodeDataToCurrentPosition(nodes){
        nodes.each(function(d){
            var transform = getTransform(d3.select(this));
            d.x = d.px = transform.translate[0];
            d.y = d.py = transform.translate[1];
            d.fixed = true;
        });
    }

    function getData(type) {
        if(type === 'editor'){
            return {
                dataset: editorData,
                elements: editorElements
            };
        } else if(type === 'editorAddButton'){
            return {
                dataset: editorData.addButton,
                elements: editorElements.addButton
            }
        }

        return {
            dataset: data,
            elements: elements
        };
    }

///////////////
// Animation //
///////////////

    var currentAnimating = false,
        prevAnimationTimeout = {
            id: null,
            timestamp: null
        };

    function blockAnimations(_duration){
        _duration = (_duration || config.duration) + 25; // Give the duration a buffer
        var endDate = Date.now() + _duration;

        if(endDate > prevAnimationTimeout.timestamp){
            clearTimeout(prevAnimationTimeout.id);
            prevAnimationTimeout.timestamp = endDate;

            currentAnimating = true;

            prevAnimationTimeout.id = setTimeout(function(){
                currentAnimating = false;
            }, _duration);
        }
    }

    function isAnimating(){
        return currentAnimating;
    }

    function transitionHandler(transition, args) {
        var n, startN, startCallback, interruptCallback, endCallback;

        n = startN = 0;

        (function setup() {
            if(typeof args.onStart === 'function'){
                startCallback = args.onStart;
            }

            if(typeof args.onInterrupt === 'function'){
                interruptCallback = args.onInterrupt;
            }

            if(typeof args.onEnd === 'function'){
                endCallback = args.onEnd;
                if(!interruptCallback){ interruptCallback = endCallback; }
            }
        })();

        // If an empty transition
        if(!transition.size()){
            if(typeof startCallback === 'function'){ startCallback(); }
            if(typeof interruptCallback === 'function' && interruptCallback !== endCallback ){ interruptCallback(); }
            if(typeof endCallback === 'function'){ endCallback(); }

            return false;
        }

        function start(_transition){
            _transition.each('start', function(){
                if (!--startN && startCallback) {
                    // console.log('starting', _transition.namespace);
                    startCallback.apply(this, arguments);
                }
            });
        }

        function interrupt(_transition){
            _transition.each('interrupt', function() {
                if (!--n && interruptCallback) {
                    // console.warn('interrupted', _transition.namespace, n);
                    interruptCallback.apply(this, arguments);
                }
            })

        }

        function end(_transition){
            _transition.each('end', function() {
                if (!--n && endCallback) {
                    // console.log('end', _transition.namespace);
                    endCallback.apply(this, arguments);
                }
            });
        }

        transition.each(function() { startN = ++n; });
        if(startCallback)    { transition.call(start); }
        if(interruptCallback){ transition.call(interrupt); }
        if(endCallback)      { transition.call(end); }
    }

    function transitionFinished(transition, callback){
        transition.call(transitionHandler, {
            onEnd: callback
        });
    }

    function transitionStart(transition, callback){
        transition.call(transitionHandler, {
            onStart: callback
        });
    }

    function getTransition(transition, id) {
        return transition.filter(function(_transition){
            return _transition.id === id;
        })[0];
    }

//////////////////
// Zoom Scaling //
//////////////////

    function determineScale(){
        var minZoom  = config.zoomLimits[0],
            maxZoom  = config.zoomLimits[1],
            maxScale = (maxZoom - minZoom) / config.nodes.maxScale,
            diff     = Math.abs(data.zoomScale - maxZoom);

        return Math.max(diff / maxScale,  1); // Never allow the scale to shrink below 1
    }

    function changeScale(){
        var transform = getTransform(this),
            scale = determineScale();
        transform.scale = [scale, scale];
        return transform.toString();
    }

    function revertScale(){
        var transform = getTransform(this);
        transform.scale = [1, 1];
        return transform.toString();
    }

//////////
// Misc //
//////////

    function isEID(eid){
        if(typeof eid !== 'string') { return false; }
        return /^[a-zA-Z]{3}\.[a-zA-Z]{3}\.\d{3}(\.\d{1,3})?$/.test(eid);
    }

    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) { func.apply(context, args); }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) { func.apply(context, args); }
        };
    }

    function syncGroupDimensions(nodes) {
        nodes.selectAll('rect.backplate').each(function(){
            var backplate, parentGroup, boundingBox;
            if(!this || !this.parentNode){ return; }

            // Reset size of backplate before calculating bounding box
            backplate = d3.select(this)
                .attr({
                    width: 0,
                    height: 0
                });

            parentGroup = this.parentNode;

            // https://bugzilla.mozilla.org/show_bug.cgi?id=612118
            try {
                boundingBox = parentGroup.getBBox();
            } catch(e) {
                boundingBox = {
                    width: 0,
                    height: 0,
                    x: 0,
                    y: 0
                }
            }

            backplate
                .attr({
                    height: boundingBox.height,
                    width: boundingBox.width,
                    x: boundingBox.x,
                    y: boundingBox.y
                });
        });
    }

    function moveNucleusToFront(nodes){
        nodes = nodes || elements.nodes;
        var newestNucleus = nodes.filter(function(d){
            return isCurrentNucleus(d);
        });
        newestNucleus.moveToFront();
    }

    function insertBefore(nodes, targetNode) {
        return nodes.each(function() {
            if(!(this instanceof Node)){ return; }
            this.parentNode.insertBefore(this, targetNode);
        });
    }

    function moveGroupToFront(args) {
        var group = getCurrentElementsGroup(args);
        if(!group){ return; }
        if(group.links.size()){ group.links.moveToFront(); }
        if(group.nodes.size()){ group.nodes.moveToFront(); }
        if(group.nucleus){ group.nucleus.moveToFront(); }
    }

    function recalcSizes(){
        var width = winWidth(),
            height = winHeight(),
            resolution;

        var widthBreakpoints = config.widthBreakpoints.filter(function(res){
                return width <= res;
            }),
            resolutionWidth  = config.svgResWidths[ Math.min.apply(null, widthBreakpoints) ];


        var heightBreakpoints = config.heightBreakpoints.filter(function(res){
                return height <= res;
            }),
            resolutionHeight = config.svgResHeights[ Math.min.apply(null, heightBreakpoints) ];

        if(resolutionHeight && !isTouchDevice){
            resolution = {
                svgScale: Math.max(resolutionHeight.svgScale, resolutionWidth.svgScale),
                fontSize: Math.max(resolutionHeight.fontSize, resolutionWidth.fontSize)
            };
        } else {
            resolution = resolutionWidth;
        }

        config.fontSize  = resolution.fontSize;
        config.fontRatio = resolution.fontSize / 16;
        config.svgScale  = resolution.svgScale;
    }

    /////////////
    // Browser //
    /////////////

    function winWidth() {
        var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        if(config.width !== width){ config.width = width; }
        return width;
    }

    function winHeight() {
        return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    }

    function svgHeight() {
        var height = winHeight() - calcHeightOffset();
        if(config.height !== height){ config.height = height; }
        return height;
    }

    function calcHeightOffset(){
        var browsePageHeader = $('.browseheader--conceptmap'),
            browsePageHeight = browsePageHeader.length && browsePageHeader.is(':visible') ? browsePageHeader.height() + 30 /* Add 30 here for modality popup */ : 0;

        var heightOffset = $('header').height() + $('#conceptmap-nav').height() + browsePageHeight;

        if(heightOffset !== config.heightOffset){ config.heightOffset = heightOffset; }
        return config.heightOffset;
    }

    var isIE11 = !!(navigator.userAgent.match(/Trident/) && navigator.userAgent.match(/rv[ :]11/)),
        isEdge = /Edge\/\d+./i.test(navigator.userAgent),
        isMicrosoftBrowser = (isIE11 || isEdge),
        isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 && navigator.userAgent && !navigator.userAgent.match('CriOS'),
        isTouchDevice = 'ontouchstart' in window;

    function isPortrait(width, height) {
        width = width || winWidth();
        height = height || winHeight();
        return width < height;
    }

    function isLandscape(width, height) {
        width = width || winWidth();
        height = height || winHeight();
        return width > height;
    }

    function getURLParams(){
        var search, params,
            urlParams = {};

        if(window.location.search && !config.urlParams) {
            search    = decodeURI(window.location.search);
            params    = search.substr(1).split('&');

            params.forEach(function(param){
                param = param.split('=');
                urlParams[param[0]] = param[1];
            });
        }

        // Get subject implicitly from pathname
        if(/view=mapview/.test(location.search)){
            urlParams.subject = location.pathname.split('/')[1];
        }

        config.urlParams = urlParams;

        return config.urlParams;
    }

    function addFilterToGroup(filter) {
        getCurrentGroup().filter = filter;
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function isNum(num) {
        return typeof num === 'number';
    }

    function clone(){
        return $.extend.apply(null,
            Array.prototype.concat.apply([{}], arguments)
        );
    }

    function extend(obj){
        if(typeof obj !== 'object'){ throw Error('Cannot extend non-object')}
        return $.extend.apply(null,
            Array.prototype.concat.apply(
                [obj],
                Array.prototype.slice.call(arguments, 1)
            )
        );
    }


    return {
        isNucleus: isNucleus,
        isNode: isNode,
        isCurrentNucleus: isCurrentNucleus,
        getCurrentNucleus: getCurrentNucleus,
        getCurrentNucleusNode: getCurrentNucleusNode,
        isActive: isActive,
        getCurrentGroup: getCurrentGroup,
        getCurrentElementsGroup: getCurrentElementsGroup,
        currentGroupContains: currentGroupContains,
        getPreviousGroup: getPreviousGroup,
        getNodes: getNodes,
        isHighlightedNode: isHighlightedNode,
        getParentGroup: getParentGroup,
        getSelectedGroup: getSelectedGroup,
        getGroup: getGroup,
        isSameGroup: isSameGroup,
        getElementsFromGroup: getElementsFromGroup,
        getNodesFromGroup: getNodesFromGroup,
        getLinksFromGroup: getLinksFromGroup,

        getNodeDuration: getNodeDuration,
        stagger: stagger,
        radius: radius,
        lighten: lighten,
        inactiveLighten: inactiveLighten,

        getBranch: getBranch,
        getColor: getColor,
        getConcept: getConcept,
        getRelatedByShortname: getRelatedByShortname,
        getSubject: getSubject,
        getShortnameBySubject: getShortnameBySubject,
        getTopLevelParent: getTopLevelParent,
        getTransform: getTransform,
        getColorIndex: getColorIndex,
        getSizeIndex: getSizeIndex,
        sampleSubjectsWithRelated: sampleSubjectsWithRelated,

        addFilterToGroup: addFilterToGroup,

        syncNodeData: syncNodeData,
        syncLinkData: syncLinkData,
        syncData: syncData,
        syncElementsToGroup: syncElementsToGroup,
        syncNodeDataToCurrentPosition: syncNodeDataToCurrentPosition,
        getData: getData,

        textPositionX: textPositionX,
        textPositionXNucleus: textPositionXNucleus,
        textPositionY: textPositionY,
        textPositionYNucleus: textPositionYNucleus,
        getTextPosition: getTextPosition,
        isTopHalfOfCircle: isTopHalfOfCircle,

        isPopupOpen: isPopupOpen,
        isZeroState: isZeroState,
        isEditorState: isEditorState,

        isAnimating: isAnimating,
        blockAnimations: blockAnimations,
        transitionHandler: transitionHandler,
        transitionFinished: transitionFinished,
        transitionStart: transitionStart,
        getTransition: getTransition,

        fakeDisplay: fakeDisplay,
        show: show,
        hide: hide,
        showOverlay: showOverlay,
        hideOverlay: hideOverlay,

        wrapTextDownwards: wrapTextDownwards,
        updateTextSize: updateTextSize,

        calcViewBox: calcViewBox,
        setViewBox: setViewBox,
        getViewBox: getViewBox,
        getCenterCoords: getCenterCoords,
        getCenterX: getCenterX,
        getCenterY: getCenterY,

        changeScale: changeScale,
        revertScale: revertScale,
        determineScale: determineScale,

        isEID: isEID,
        getModalities: getModalities,
        getRelated: getRelated,

        debounce: debounce,

        syncGroupDimensions: syncGroupDimensions,

        moveNucleusToFront: moveNucleusToFront,
        moveGroupToFront: moveGroupToFront,

        insertBefore: insertBefore,

        recalcSizes: recalcSizes,

        winWidth: winWidth,
        winHeight: winHeight,
        svgHeight: svgHeight,

        isSafari: isSafari,
        isIE11: isIE11,
        isEdge: isEdge,
        isMicrosoftBrowser: isMicrosoftBrowser,
        isTouchDevice: isTouchDevice,
        isPortrait: isPortrait,
        isLandscape: isLandscape,
        getURLParams: getURLParams,

        getRandomInt: getRandomInt,
        isNum: isNum,
        clone: clone,
        extend: extend
    };

});
