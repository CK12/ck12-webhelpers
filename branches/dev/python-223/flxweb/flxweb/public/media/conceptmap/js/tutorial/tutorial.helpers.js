define([
    'd3',
    'conceptmap/tutorial/tutorial.config',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/graph.helpers',
    'conceptmap/editor/editor.elements',
    'conceptmap/filter'
], function(d3, tConfig, elements, helpers, editorElements, filter){
    var el = tConfig.elements,
        classes  = tConfig.classes;


    function show($el) {
        return $el.removeClass('hide');
    }

    function hide($el) {
        return $el.addClass('hide');
    }

    function hideSlide($el){
        return $el.removeClass(classes.slideActive);
    }

    function showSlide($el){
        return $el.addClass(classes.slideActive);
    }

    function isTutorialOpen(){
        return el.$tutorialModal.hasClass(classes.tutorialActive);
    }

    function setTranslate(slideX, slideY){
        var measurementX = typeof slideX === 'number' ? 'px' : '',
            measurementY = typeof slideY === 'number' ? 'px' : '';

        var transX = slideX ? 'translateX(' + slideX + measurementX + ')' : '',
            transY = slideY ? 'translateY(' + slideY + measurementY + ')' : '';

        return transX + transY;
    }

    function setTranslateX(slideX){
        return setTranslate(slideX, null);
    }

    function getTutorialStartingPos(){
        var anchorRect = tConfig.anchors[1],
            currentRect = el.$tutorialModal[0].getBoundingClientRect();

        var anchorCenterX = anchorRect.left + anchorRect.width / 2,
            anchorCenterY = anchorRect.bottom - anchorRect.top / 3;

        var minX = Math.min(anchorCenterX, currentRect.left),
            maxX = Math.max(anchorCenterX, currentRect.left),
            minY = Math.min(currentRect.top, anchorCenterY),
            maxY = Math.max(currentRect.top, anchorCenterY);

        var x = maxX - minX,
            y = minY - maxY;

        return {
            x: x,
            y: y
        };
    }

    function getNodeFromTopHalf(){
        var topElements = elements.nodes.filter(function(d){
                return helpers.isTopHalfOfCircle(d) && helpers.isNode(d) && helpers.currentGroupContains(d);
            }),
            randNode = topElements[0][ helpers.getRandomInt(0, topElements.size()) ];

        return d3.select(randNode).select('circle.main').node();
    }

    function getAnchors(){
        var node = getNodeFromTopHalf();

        tConfig.anchors = {
            1: el.icon.$navTips.parent()[0].getBoundingClientRect(),
            2: filter.$filterHolder[0].getBoundingClientRect(),
            3: node.getBoundingClientRect(),
            4: editorElements.$widget.find('.slide-1')[0].getBoundingClientRect()
        };

        tConfig.tutorialNode = node;

        return tConfig.anchors;
    }

    function getSlide($el) {
        var slide = $el.attr('data-slide');
        if(slide){ return parseInt(slide); }
        // Handle next button below
        return parseInt( el.$dots.filter('.' + tConfig.classes.dotActive).attr('data-slide') ) + 1;
    }

    return {
        show: show,
        hide: hide,
        hideSlide: hideSlide,
        showSlide: showSlide,
        isTutorialOpen: isTutorialOpen,
        setTranslate: setTranslate,
        setTranslateX: setTranslateX,
        getTutorialStartingPos: getTutorialStartingPos,
        getAnchors: getAnchors,
        getSlide: getSlide
    };
});