define([
    'jquery',
    'conceptmap/graph/graph.logger',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.events',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.initializer',
    'conceptmap/graph/graph.ui',
    'conceptmap/graph/graph.position',
    'conceptmap/graph/graph.transitions',
    'conceptmap/graph/graph.animation',
    'conceptmap/tutorial/tutorial.config',
    'conceptmap/tutorial/tutorial.helpers',
    'conceptmap/filter',
    'conceptmap/user/user',
    'conceptmap/graph/graph.notification'
], function($, logger, helpers, elements, data, events, config, initializer, ui, position, transitions, animation, tConfig, tHelpers, filter, User, notification){
    'use strict';

    var tc = tConfig,
        th = tHelpers,
        el = tc.elements,
        classes = tc.classes;

    var $currentSlide = el.$slides.first(),
        firstTimeUser = false;

    var highlightedNode = null;

/////////////
// Display //
/////////////

    function hideTutorial(){
        ui.enable();
        helpers.hideOverlay();
        var pos = th.getTutorialStartingPos();

        el.$tutorialModal
            .css({
                transformOrigin: 'top left',
                transform: el.$tutorialModal.css('transform') + th.setTranslate(pos.x, pos.y) + 'scale(0.01)'
            })
            .removeClass(classes.tutorialActive);

        setTimeout(function(){
            el.$tutorialModal.removeAttr('style'); // Needed to reset
        }, tConfig.slideDuration);
    }

    function showTutorial(){
        ui.disable();
        helpers.showOverlay();

        var elementsGroup = helpers.getCurrentElementsGroup(),
            group         = helpers.getCurrentGroup(),
            duration      = 250;

        var type = data.groups.length === 1 ? 'start' : 'expand';

        position[type](group.nucleus, helpers.extend(
            { currentGroup: group },
            helpers.getData()
        ));

        var repositionNodes = helpers.getTransition(
            animation.position.all(elementsGroup, duration),
            'repositionNodes'
        );

        repositionNodes.dfd.done(function(){
            animation.position.text(elementsGroup.nodes);

            transitions.centerGraph({duration: duration}).done(function(){
                th.getAnchors();

                var pos = th.getTutorialStartingPos();

                changeSlide(el.$dots.first());

                // We're setting the tutorial to the info icon as a starting position
                // Override the transition duration set by CSS to remove initial delay it would take
                el.$tutorialModal
                .css({
                    transitionDuration: '0s',
                    transform: th.setTranslate(pos.x, pos.y) + 'scale(0.01)'
                });

                setTimeout(function(){
                    // CSS handles from here to make it appear that the tutorial is growing out from
                    // it's current position at the info icon
                    el.$tutorialModal
                        .addClass(classes.tutorialActive)
                        .removeAttr('style');
                }, 100);
            });
        });


    }

////////////
// Slides //
////////////

    function changeDotState(slide){
        var $dot = el.$dots.eq(parseInt(slide) - 1);
        el.$dots.removeClass(classes.dotActive);
        $dot.addClass(classes.dotActive);
    }

    function changeButtonState(slide) {
        // If last slide
        if(slide === el.$slides.length){
            //th.hide( el.$exit );
            th.hide( el.$next );
            th.hide( el.$start );
            th.show( el.$end );
        } else if (slide === 1){
            th.hide( el.$end );
            th.hide( el.$next );
            if(!firstTimeUser){ th.show( el.$exit ); }
            th.show( el.$start );

        } else {
            th.hide( el.$end );
            th.hide( el.$start );
            if(!firstTimeUser){ th.show( el.$exit ); }
            th.show( el.$next );
        }
    }

    function changeSlide(e){
        var $el        = e.length ? e : $(e.currentTarget),
            slide      = th.getSlide($el),
            $prevSlide = $currentSlide;

        $currentSlide = el.$slides.eq(slide - 1);

        slideStateTransition(slide);

        th.hideSlide( $prevSlide );
        th.showSlide( $currentSlide );

        changeDotState(slide);
        changeButtonState(slide);
    }

    function slideStateTransition(slide){
        var anchorRect  = tc.anchors[slide],
            arrowOffset = 22;

        var slideWidth   = Math.max(350, Math.min(config.width / 3, 500)), // Max of 500px width, min of 350
            slideWidthpx = slideWidth + 'px';

        var slideHeight   = Math.max(175, Math.min(config.height / 5, 350)), // Max of 350px height, min of 175
            slideHeightpx = slideHeight + 'px';

        $('.' + classes.highlight).removeClass(classes.highlight);

        if (slide === 1){
            el.$tutorialModal.removeAttr('style');
            el.$tutorialModalArrow.removeAttr('style');

        } else if (slide === 2){
            filter.open(); // Ensure the button dropdown is active
            el.$tutorialModal.css({
                height: slideHeightpx,
                width: slideWidthpx,
                transform: th.setTranslate(
                    anchorRect.right + arrowOffset,
                    anchorRect.top
                )
            });

            el.$tutorialModalArrow.css({
                opacity: 1,
                transform: th.setTranslate(-(arrowOffset - 3), (slideHeight / 2)) + 'rotate(270deg)'
            });

            $('.side-nav-left').addClass(classes.highlight);

        } else if (slide === 3){
            var selectedGroup = d3.select( helpers.getParentGroup( tc.tutorialNode ));

            highlightedNode = selectedGroup;

            selectedGroup
                .call(events.unbind);

            events.mouseenter.call(selectedGroup, selectedGroup.datum());

            el.$tutorialModal.css({
                height: slideHeightpx,
                width: slideWidthpx,
                transform: th.setTranslateX('-50%') + th.setTranslate(
                    anchorRect.left + anchorRect.width / 2,
                    anchorRect.bottom + arrowOffset + 20 // 20 is offset for expanded node
                )
            });

            el.$tutorialModalArrow.css({
                opacity: 1,
                transform: th.setTranslateX(slideWidth / 2) + th.setTranslateX('-50%')
            });

        } else if (slide === 4){
            el.$tutorialModal.css({
                height: slideHeightpx,
                width: slideWidthpx,
                transform: th.setTranslateX('-100%') + th.setTranslate(
                    anchorRect.right,
                    anchorRect.top - slideHeight - arrowOffset
                )
            });

            el.$tutorialModalArrow.css({
                opacity: 1,
                transform: th.setTranslateX(slideWidth) + th.setTranslate('-200%', (slideHeight + 13)) + 'rotate(180deg)'
            });

            el.icon.$editor
                .addClass(classes.highlight)
                .css('position', 'relative');
        }

        unhighlightNode(slide);
    }

    function unhighlightNode(slide){
        if(highlightedNode && slide !== 3){
            events.mouseleave.call(highlightedNode, highlightedNode.datum());
            events.bind.call(highlightedNode);

            highlightedNode = null;
        }
    }

//////////////
// New User //
//////////////

    function handleFirstTimeUser() {
        if(config.urlParams && helpers.isEID(config.urlParams.eid)) {
            changeToSearch(config.urlParams.eid);
        } else if(helpers.isZeroState()){
            var eid;

            // We want select an eid and make it appear as if the app is in a non-zero state
            if(config.urlParams && config.urlParams.subject){
                // If this is a subject page, get a random eid from subject with related
                var shortname = helpers.getShortnameBySubject(config.urlParams.subject),
                    list      = helpers.getRelatedByShortname(shortname),
                    sample    = helpers.sampleSubjectsWithRelated(list, 7); // Should have at least 7 related

                eid = sample[0].EID;
            } else {
                eid = config.trending.defaults[0]; // Half life
            }

            changeToSearch(eid);
        } else {
            setupFirstTimeTutorial();
        }

        function changeToSearch(eid){
            initializer.searchState({
                eid: eid
            }).done(function(){
                setupFirstTimeTutorial(true);
            });
        }
    }

    function setupFirstTimeTutorial(waitToShow){
        //th.hide( el.$exit );
        if(waitToShow){
            setTimeout(
                showTutorial,
                helpers.getNodeDuration(helpers.getCurrentNucleus()) + 500 // Add half second buffer for insurance on getting final node rects
            );
            logger.tutorial('launch', 'show_tutorial');
        } else {
            showTutorial();
            logger.tutorial('launch', 'show_tutorial');
        }
    }

//////////
// Bind //
//////////

    function bind(){
        el.$dots.on('click', function(e){
            changeSlide(e);
            logger.tutorial('dot', 'screen_dot');
        });
        el.$next.on('click', function(e){
            changeSlide(e);
            logger.tutorial('button', 'next');
        });
        el.$start.on('click', function(e){
            changeSlide(e);
            logger.tutorial('button', 'next');
        });
        el.$exit.on('click', function(e){
            hideTutorial(e);
            unhighlightNode();
            logger.tutorial('link', 'skip');
        });
        el.$end.on('click', function(e){
            hideTutorial(e);
            firstTimeUser = false;
            th.show( el.$exit );
            logger.tutorial('button', 'start_exploring');
        });
        el.icon.$navTips.on('click', function(e){
            if(helpers.isZeroState()){ return; }
            if(!helpers.getNodes().length){
                return notification.create({
                    body: '<p>The tutorial is not available on a empty concept.</p> <p>Please try selecting a different filter or concept.</p>',
                    duration: Infinity
                });
            }
            showTutorial(e);
            logger.mainScreen('button', 'show_tutorial');
        });
        el.$slides.first().find('.mock-video-cover').on('click', function(){
            var $tutorialVideo = $('.tutorial-video'),
                iframe         = $tutorialVideo[0].contentWindow;

            $tutorialVideo.addClass('is--active');
            iframe.postMessage(JSON.stringify({
                event: 'command',
                func: 'playVideo',
                args: ''
            }), 'https://www.youtube.com');
        });

        $('.tutorial-video__close-button').on('click', function(){
            var $tutorialVideo = $('.tutorial-video'),
                iframe         = $tutorialVideo[0].contentWindow;

            $tutorialVideo.removeClass('is--active');
            iframe.postMessage(JSON.stringify({
                event: 'command',
                func: 'pauseVideo',
                args: ''
            }), 'https://www.youtube.com');
        });
    }

////////////////
// Initialize //
////////////////

    function init(){
        var dfd          = $.Deferred(),
            _skipTutorial = dfd.reject,
            _showTutorial = function _showTutorial(){
                if(!$.cookie('seenConceptmapTutorial')){
                    $.cookie('seenConceptmapTutorial', true, { expires: 30, path: '/' });
                }

                firstTimeUser = true;
                dfd.resolve();
                handleFirstTimeUser();
            }

        $.when(User.get()).done(function(user){
            // If they've seen the tutorial before then just skip
            if($.cookie('seenConceptmapTutorial')){ return _skipTutorial(); }

            // If not logged in
            if(!user.isLoggedIn()){ return _showTutorial(); }

            // Check for app data
            user.getAppData('conceptmap')
                .done(function(res){
                    res = res.response;
                    // If no app data present, set it
                    if(!res.userdata || (res.userdata && !res.userdata.seenTutorial) ){
                        user.setAppData('conceptmap', helpers.extend(
                            res.userdata || {},
                            {
                                seenTutorial: true
                            }
                        ));
                        _showTutorial();
                    } else {
                        _skipTutorial();
                    }
                })
                .fail(_skipTutorial);
        })
        .fail(_skipTutorial);

        bind();
        return dfd.promise();
    }

//////////
// Misc //
//////////

    function onResize(){
        if(th.isTutorialOpen()){
            th.getAnchors();
            slideStateTransition(th.getSlide($currentSlide));
        } else if( !helpers.isZeroState() && !helpers.isEditorState() ){
            th.getAnchors();
        }
    }

/////////////
// Exports //
/////////////

    return {
        init: init,
        bind: bind,
        onResize: onResize
    };
});
